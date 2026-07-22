import { Injectable } from "@nestjs/common";
import type { WeightUnit } from "@ihsan/contracts";
import { buildLastNDays, countCompletedWorkouts, averageCalories } from "../../domain/services/weekly-rollup-calculator.service";
import { projectGoalDate } from "../../domain/services/goal-projection-calculator.service";
import { WorkoutDayLine } from "../../../training/domain/entities/program.entity";
import { MealEntity } from "../../../nutrition/domain/entities/meal.entity";
import { DailyMacroSummary } from "../../../nutrition/application/use-cases/get-daily-macro-summary.use-case";
import { HabitWithStatus } from "../../../habits/application/use-cases/list-habits.use-case";
import { GoalEntity } from "../../../goals/domain/entities/goal.entity";
import { GetTodaysWorkoutDayUseCase } from "../../../training/application/use-cases/get-todays-workout-day.use-case";
import { ListSessionsUseCase } from "../../../training/application/use-cases/list-sessions.use-case";
import { ListProgramsUseCase } from "../../../training/application/use-cases/list-programs.use-case";
import { ListMealsByDateUseCase } from "../../../nutrition/application/use-cases/list-meals-by-date.use-case";
import { GetDailyMacroSummaryUseCase } from "../../../nutrition/application/use-cases/get-daily-macro-summary.use-case";
import { ListHabitsUseCase } from "../../../habits/application/use-cases/list-habits.use-case";
import { GetWeeklyHabitCompletionUseCase } from "../../../habits/application/use-cases/get-weekly-habit-completion.use-case";
import { ListGoalsUseCase } from "../../../goals/application/use-cases/list-goals.use-case";
import { GetLatestWeightEntryUseCase } from "../../../progress/application/use-cases/get-latest-weight-entry.use-case";

const WEEK_LENGTH_DAYS = 7;

export interface DashboardResult {
  today: string;
  todaysWorkoutDay: WorkoutDayLine | null;
  todaysMeals: MealEntity[];
  todaysHabits: HabitWithStatus[];
  macroSummary: DailyMacroSummary;
  currentWeightKg: number | null;
  weightUnit: WeightUnit;
  activeWeightGoal: GoalEntity | null;
  projectedGoalDate: string | null;
  weeklyProgress: {
    workoutsCompleted: number;
    workoutsPlanned: number;
    avgCalories: number | null;
    habitCompletionPercent: number;
  };
}

@Injectable()
export class GetDashboardUseCase {
  constructor(
    private readonly getTodaysWorkoutDay: GetTodaysWorkoutDayUseCase,
    private readonly listSessions: ListSessionsUseCase,
    private readonly listPrograms: ListProgramsUseCase,
    private readonly listMealsByDate: ListMealsByDateUseCase,
    private readonly getDailyMacroSummary: GetDailyMacroSummaryUseCase,
    private readonly listHabits: ListHabitsUseCase,
    private readonly getWeeklyHabitCompletion: GetWeeklyHabitCompletionUseCase,
    private readonly listGoals: ListGoalsUseCase,
    private readonly getLatestWeightEntry: GetLatestWeightEntryUseCase,
  ) {}

  async execute(userId: string, today: string, weightUnit: WeightUnit): Promise<DashboardResult> {
    const last7Days = buildLastNDays(today, WEEK_LENGTH_DAYS);
    const sevenDaysAgo = last7Days[0]!;

    const [
      todaysWorkoutDay,
      programs,
      sessionsInRange,
      todaysMeals,
      dailySummaries,
      todaysHabits,
      habitCompletionPercent,
      goals,
      latestWeightEntry,
    ] = await Promise.all([
      this.getTodaysWorkoutDay.execute(userId, today),
      this.listPrograms.execute(userId),
      this.listSessions.execute(userId, sevenDaysAgo, today),
      this.listMealsByDate.execute(userId, today),
      Promise.all(last7Days.map((date) => this.getDailyMacroSummary.execute(userId, date))),
      this.listHabits.execute(userId, today),
      this.getWeeklyHabitCompletion.execute(userId, last7Days),
      this.listGoals.execute(userId),
      this.getLatestWeightEntry.execute(userId),
    ]);

    const macroSummary = dailySummaries[dailySummaries.length - 1]!;
    const activeProgram = programs.find((program) => program.isActive);
    const activeWeightGoal = goals.find((goal) => goal.type === "WEIGHT" && goal.status === "ACTIVE") ?? null;

    let projectedGoalDate: string | null = null;
    if (activeWeightGoal && latestWeightEntry) {
      projectedGoalDate = projectGoalDate({
        currentWeightKg: latestWeightEntry.weightKg,
        currentDate: latestWeightEntry.date,
        startWeightKg: activeWeightGoal.startValue,
        startDate: activeWeightGoal.startDate,
        targetWeightKg: activeWeightGoal.targetValue,
      });
    }

    return {
      today,
      todaysWorkoutDay,
      todaysMeals,
      todaysHabits,
      macroSummary,
      currentWeightKg: latestWeightEntry?.weightKg ?? null,
      weightUnit,
      activeWeightGoal,
      projectedGoalDate,
      weeklyProgress: {
        workoutsCompleted: countCompletedWorkouts(sessionsInRange),
        workoutsPlanned: activeProgram?.days.length ?? 0,
        avgCalories: averageCalories(dailySummaries.map((summary) => summary.consumed.calories)),
        habitCompletionPercent,
      },
    };
  }
}
