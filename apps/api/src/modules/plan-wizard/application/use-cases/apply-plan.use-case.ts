import { Injectable } from "@nestjs/common";
import type { MealType } from "@ihsan/contracts";
import { CreateProgramUseCase } from "../../../training/application/use-cases/create-program.use-case";
import { ActivateProgramUseCase } from "../../../training/application/use-cases/activate-program.use-case";
import { SetNutritionTargetUseCase } from "../../../nutrition/application/use-cases/set-nutrition-target.use-case";
import { CreateMealTemplateUseCase } from "../../../nutrition/application/use-cases/create-meal-template.use-case";
import { CreateGoalUseCase } from "../../../goals/application/use-cases/create-goal.use-case";
import { GeneratedDay } from "../../domain/services/split-generator.service";
import { MacroTargets } from "../../domain/services/tdee-calculator.service";
import { ProposedWeightGoal } from "./generate-plan.use-case";

export interface SelectedMealRecipes {
  breakfast?: string;
  lunch?: string;
  dinner?: string;
  snack?: string;
}

export interface ApplyPlanInput {
  program: { name: string; days: GeneratedDay[] };
  nutritionTarget: MacroTargets;
  selectedMealRecipes: SelectedMealRecipes;
  weightGoal: ProposedWeightGoal | null;
}

export interface ApplyPlanResult {
  programId: string;
  mealTemplateId: string | null;
  goalId: string | null;
}

@Injectable()
export class ApplyPlanUseCase {
  constructor(
    private readonly createProgram: CreateProgramUseCase,
    private readonly activateProgram: ActivateProgramUseCase,
    private readonly setNutritionTarget: SetNutritionTargetUseCase,
    private readonly createMealTemplate: CreateMealTemplateUseCase,
    private readonly createGoal: CreateGoalUseCase,
  ) {}

  async execute(userId: string, input: ApplyPlanInput, today: string): Promise<ApplyPlanResult> {
    const program = await this.createProgram.execute(userId, {
      name: input.program.name,
      days: input.program.days.map((day) => ({
        name: day.name,
        dayOrder: day.dayOrder,
        exercises: day.exercises.map((exercise) => ({
          exerciseId: exercise.exerciseId,
          order: exercise.order,
          targetSets: exercise.targetSets,
          targetRepsMin: exercise.targetRepsMin,
          targetRepsMax: exercise.targetRepsMax,
          restSeconds: exercise.restSeconds,
        })),
      })),
    });
    await this.activateProgram.execute(program.id, userId);

    await this.setNutritionTarget.execute(userId, { ...input.nutritionTarget, effectiveFrom: today });

    const templateItems: { recipeId: string; quantity: number; mealType: MealType }[] = [];
    const { breakfast, lunch, dinner, snack } = input.selectedMealRecipes;
    if (breakfast) templateItems.push({ recipeId: breakfast, quantity: 1, mealType: "BREAKFAST" });
    if (lunch) templateItems.push({ recipeId: lunch, quantity: 1, mealType: "LUNCH" });
    if (dinner) templateItems.push({ recipeId: dinner, quantity: 1, mealType: "DINNER" });
    if (snack) templateItems.push({ recipeId: snack, quantity: 1, mealType: "SNACK" });

    let mealTemplateId: string | null = null;
    if (templateItems.length > 0) {
      const template = await this.createMealTemplate.execute(userId, { name: "My Plan Meals", items: templateItems });
      mealTemplateId = template.id;
    }

    let goalId: string | null = null;
    if (input.weightGoal) {
      const goal = await this.createGoal.execute(userId, {
        type: "WEIGHT",
        startValue: input.weightGoal.startValue,
        targetValue: input.weightGoal.targetValue ?? input.weightGoal.startValue,
        startDate: today,
        targetDate: input.weightGoal.targetDate ?? undefined,
      });
      goalId = goal.id;
    }

    return { programId: program.id, mealTemplateId, goalId };
  }
}
