import { Injectable } from "@nestjs/common";
import type { LlmPlanContent } from "@ihsan/contracts";
import { ListExercisesUseCase } from "../../../training/application/use-cases/list-exercises.use-case";
import { ListRecipesUseCase } from "../../../nutrition/application/use-cases/list-recipes.use-case";
import { todayDateString } from "../../../../shared/utils/today.util";
import {
  BiologicalSex,
  JobType,
  MacroTargets,
  WeightGoalDirection,
  calculateMacroTargets,
} from "../../domain/services/tdee-calculator.service";
import {
  CatalogExercise,
  EquipmentAccess,
  GeneratedDay,
  TrainingGoal,
  generateTrainingSplit,
} from "../../domain/services/split-generator.service";
import { CatalogRecipe, DietaryRestriction, MealSuggestionResult, suggestMeals } from "../../domain/services/meal-suggestor.service";
import { computeWeightGoalTargetDate } from "../../domain/services/weight-goal-date.service";
import { AiPlanContentService, OtherActivityInput } from "../services/ai-plan-content.service";

export type ExperienceLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

export interface PlanIntake {
  daysPerWeek: number;
  experienceLevel: ExperienceLevel;
  trainingGoal: TrainingGoal;
  physicalRestrictions: string;
  equipmentAccess: EquipmentAccess;
  jobType: JobType;
  dietaryRestrictions: DietaryRestriction[];
  otherDietaryNotes: string;
  mealsPerDay: number;
  weightGoalDirection: WeightGoalDirection;
  targetWeightKg: number | null;
  age: number;
  currentWeightKg: number;
  heightCm: number;
  sex: BiologicalSex;
  programDurationWeeks: number;
  otherActivities: OtherActivityInput[];
  weightChangePaceKgPerMonth: number | null;
}

export interface ProposedWeightGoal {
  direction: WeightGoalDirection;
  startValue: number;
  targetValue: number | null;
  targetDate: string | null;
}

export interface RecipeSuggestion {
  id: string;
  name: string;
  dietaryTags: string[];
}

export interface MealSuggestions {
  breakfast: RecipeSuggestion[];
  lunch: RecipeSuggestion[];
  dinner: RecipeSuggestion[];
  snack: RecipeSuggestion[];
  warnings: string[];
}

export interface ProposedPlan {
  program: { name: string; days: GeneratedDay[] };
  nutritionTarget: MacroTargets;
  mealSuggestions: MealSuggestions;
  weightGoal: ProposedWeightGoal | null;
  notes: string[];
  aiGenerated: boolean;
}

const AI_UNAVAILABLE_NOTE =
  "Generated with our standard rules — AI-personalized coaching was unavailable this time, feel free to try again.";

function toRecipeSuggestions(result: MealSuggestionResult): MealSuggestions {
  const strip = (recipes: CatalogRecipe[]): RecipeSuggestion[] =>
    recipes.map((recipe) => ({ id: recipe.id, name: recipe.name, dietaryTags: recipe.dietaryTags }));
  return {
    breakfast: strip(result.breakfast),
    lunch: strip(result.lunch),
    dinner: strip(result.dinner),
    snack: strip(result.snack),
    warnings: result.warnings,
  };
}

@Injectable()
export class GeneratePlanUseCase {
  constructor(
    private readonly listExercises: ListExercisesUseCase,
    private readonly listRecipes: ListRecipesUseCase,
    private readonly aiPlanContent: AiPlanContentService,
  ) {}

  async execute(userId: string, intake: PlanIntake): Promise<ProposedPlan> {
    const [exercises, recipes] = await Promise.all([
      this.listExercises.execute(userId),
      this.listRecipes.execute(userId),
    ]);

    const exerciseCatalog: CatalogExercise[] = exercises.map((exercise) => ({
      id: exercise.id,
      name: exercise.name,
      muscleGroup: exercise.muscleGroup,
      equipment: exercise.equipment,
    }));
    const recipeCatalog: CatalogRecipe[] = recipes.map((recipe) => ({
      id: recipe.id,
      name: recipe.name,
      defaultMealType: recipe.defaultMealType,
      dietaryTags: recipe.dietaryTags,
    }));

    const nutritionTarget = calculateMacroTargets({
      sex: intake.sex,
      age: intake.age,
      heightCm: intake.heightCm,
      weightKg: intake.currentWeightKg,
      jobType: intake.jobType,
      daysPerWeek: intake.daysPerWeek,
      goalDirection: intake.weightGoalDirection,
      weightChangePaceKgPerMonth: intake.weightChangePaceKgPerMonth,
    });

    const weightGoal: ProposedWeightGoal | null =
      intake.weightGoalDirection === "MAINTAIN"
        ? null
        : {
            direction: intake.weightGoalDirection,
            startValue: intake.currentWeightKg,
            targetValue: intake.targetWeightKg,
            targetDate: computeWeightGoalTargetDate({
              direction: intake.weightGoalDirection,
              startDate: todayDateString(),
              startWeightKg: intake.currentWeightKg,
              targetWeightKg: intake.targetWeightKg,
              paceKgPerMonth: intake.weightChangePaceKgPerMonth,
            }),
          };

    const aiContent = process.env.OPENROUTER_API_KEY
      ? await this.tryGenerateAi(intake, exerciseCatalog, recipeCatalog)
      : null;

    let days: GeneratedDay[];
    let mealSuggestions: MealSuggestions;
    let notes: string[];

    if (aiContent) {
      days = aiContent.days;
      mealSuggestions = aiContent.mealSuggestions;
      notes = [...aiContent.notes];
    } else {
      const splitResult = generateTrainingSplit({
        daysPerWeek: intake.daysPerWeek,
        goal: intake.trainingGoal,
        equipmentAccess: intake.equipmentAccess,
        physicalRestrictions: intake.physicalRestrictions,
        exerciseCatalog,
      });
      const suggestedMeals = suggestMeals(recipeCatalog, intake.dietaryRestrictions, intake.mealsPerDay);
      days = splitResult.days;
      mealSuggestions = toRecipeSuggestions(suggestedMeals);
      notes = [...splitResult.warnings, ...suggestedMeals.warnings];
      if (process.env.OPENROUTER_API_KEY) {
        notes.unshift(AI_UNAVAILABLE_NOTE);
      }
    }

    if (intake.experienceLevel === "BEGINNER") {
      notes.push(
        "As a beginner, prioritize form over hitting the top of each rep range — add weight only once every set feels controlled.",
      );
    }
    if (intake.otherDietaryNotes.trim()) {
      notes.push(`Other dietary notes to keep in mind yourself (not automatically filtered): ${intake.otherDietaryNotes.trim()}`);
    }

    return {
      program: { name: "My Plan", days },
      nutritionTarget,
      mealSuggestions,
      weightGoal,
      notes,
      aiGenerated: aiContent !== null,
    };
  }

  private async tryGenerateAi(
    intake: PlanIntake,
    exerciseCatalog: CatalogExercise[],
    recipeCatalog: CatalogRecipe[],
  ): Promise<LlmPlanContent | null> {
    try {
      return await this.aiPlanContent.generate({
        daysPerWeek: intake.daysPerWeek,
        experienceLevel: intake.experienceLevel,
        trainingGoal: intake.trainingGoal,
        physicalRestrictions: intake.physicalRestrictions,
        equipmentAccess: intake.equipmentAccess,
        jobType: intake.jobType,
        dietaryRestrictions: intake.dietaryRestrictions,
        otherDietaryNotes: intake.otherDietaryNotes,
        mealsPerDay: intake.mealsPerDay,
        programDurationWeeks: intake.programDurationWeeks,
        otherActivities: intake.otherActivities,
        exerciseCatalog,
        recipeCatalog,
      });
    } catch {
      return null;
    }
  }
}
