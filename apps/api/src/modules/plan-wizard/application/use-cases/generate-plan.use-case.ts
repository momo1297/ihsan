import { Injectable } from "@nestjs/common";
import { ListExercisesUseCase } from "../../../training/application/use-cases/list-exercises.use-case";
import { ListRecipesUseCase } from "../../../nutrition/application/use-cases/list-recipes.use-case";
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
import {
  CatalogRecipe,
  DietaryRestriction,
  MealSuggestionResult,
  suggestMeals,
} from "../../domain/services/meal-suggestor.service";

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
}

export interface ProposedWeightGoal {
  direction: WeightGoalDirection;
  startValue: number;
  targetValue: number | null;
}

export interface ProposedPlan {
  program: { name: string; days: GeneratedDay[] };
  nutritionTarget: MacroTargets;
  mealSuggestions: MealSuggestionResult;
  weightGoal: ProposedWeightGoal | null;
  notes: string[];
}

@Injectable()
export class GeneratePlanUseCase {
  constructor(
    private readonly listExercises: ListExercisesUseCase,
    private readonly listRecipes: ListRecipesUseCase,
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

    const splitResult = generateTrainingSplit({
      daysPerWeek: intake.daysPerWeek,
      goal: intake.trainingGoal,
      equipmentAccess: intake.equipmentAccess,
      physicalRestrictions: intake.physicalRestrictions,
      exerciseCatalog,
    });

    const nutritionTarget = calculateMacroTargets({
      sex: intake.sex,
      age: intake.age,
      heightCm: intake.heightCm,
      weightKg: intake.currentWeightKg,
      jobType: intake.jobType,
      daysPerWeek: intake.daysPerWeek,
      goalDirection: intake.weightGoalDirection,
    });

    const recipeCatalog: CatalogRecipe[] = recipes.map((recipe) => ({
      id: recipe.id,
      name: recipe.name,
      defaultMealType: recipe.defaultMealType,
      dietaryTags: recipe.dietaryTags,
    }));
    const mealSuggestions = suggestMeals(recipeCatalog, intake.dietaryRestrictions, intake.mealsPerDay);

    const notes = [...splitResult.warnings, ...mealSuggestions.warnings];
    if (intake.experienceLevel === "BEGINNER") {
      notes.push(
        "As a beginner, prioritize form over hitting the top of each rep range — add weight only once every set feels controlled.",
      );
    }
    if (intake.otherDietaryNotes.trim()) {
      notes.push(`Other dietary notes to keep in mind yourself (not automatically filtered): ${intake.otherDietaryNotes.trim()}`);
    }

    const weightGoal: ProposedWeightGoal | null =
      intake.weightGoalDirection === "MAINTAIN"
        ? null
        : { direction: intake.weightGoalDirection, startValue: intake.currentWeightKg, targetValue: intake.targetWeightKg };

    return {
      program: { name: "My Plan", days: splitResult.days },
      nutritionTarget,
      mealSuggestions,
      weightGoal,
      notes,
    };
  }
}
