import type { Dashboard } from "@ihsan/contracts";
import { toWorkoutDayDto } from "../../training/presentation/training.mapper";
import { toMealDto } from "../../nutrition/presentation/nutrition.mapper";
import { DashboardResult } from "../application/use-cases/get-dashboard.use-case";

export function toDashboardDto(result: DashboardResult): Dashboard {
  return {
    today: {
      date: result.today,
      workoutDay: result.todaysWorkoutDay ? toWorkoutDayDto(result.todaysWorkoutDay) : null,
      meals: result.todaysMeals.map(toMealDto),
      habits: result.todaysHabits.map((habit) => ({
        id: habit.id,
        userId: habit.userId,
        name: habit.name,
        isActive: habit.isActive,
        completedToday: habit.completedToday,
        currentStreak: habit.currentStreak,
        createdAt: habit.createdAt.toISOString(),
      })),
    },
    nutrition: {
      caloriesRemaining: result.macroSummary.remaining.calories,
      proteinRemainingGrams: result.macroSummary.remaining.proteinGrams,
      consumed: result.macroSummary.consumed,
      target: result.macroSummary.target,
    },
    weight: {
      current: result.currentWeightKg,
      goal: result.activeWeightGoal?.targetValue ?? null,
      unit: result.weightUnit,
      projectedGoalDate: result.projectedGoalDate,
    },
    weeklyProgress: result.weeklyProgress,
  };
}
