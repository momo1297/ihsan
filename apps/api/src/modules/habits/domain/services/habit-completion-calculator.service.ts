export interface HabitWithCompletedDates {
  completedDates: string[];
}

/** Percent of (active habit x day) slots completed across the given days. */
export function calculateWeeklyCompletionPercent(habits: HabitWithCompletedDates[], days: string[]): number {
  if (habits.length === 0 || days.length === 0) return 0;

  const totalPossible = habits.length * days.length;
  const totalCompleted = habits.reduce(
    (sum, habit) => sum + days.filter((day) => habit.completedDates.includes(day)).length,
    0,
  );

  return Math.round((totalCompleted / totalPossible) * 100);
}
