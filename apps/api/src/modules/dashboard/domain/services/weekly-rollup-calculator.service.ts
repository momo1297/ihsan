function shiftDate(dateStr: string, days: number): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(Date.UTC(year ?? 0, (month ?? 1) - 1, day ?? 1));
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

/** The last `count` calendar dates ending with (and including) `today`, oldest first. */
export function buildLastNDays(today: string, count: number): string[] {
  return Array.from({ length: count }, (_, index) => shiftDate(today, index - (count - 1)));
}

export function countCompletedWorkouts(sessions: { completedAt: Date | null }[]): number {
  return sessions.filter((session) => session.completedAt !== null).length;
}

/** Average of days that actually have logged calories — an unlogged day shouldn't dilute the average toward zero. */
export function averageCalories(dailyCalories: number[]): number | null {
  const loggedDays = dailyCalories.filter((calories) => calories > 0);
  if (loggedDays.length === 0) return null;
  const sum = loggedDays.reduce((total, calories) => total + calories, 0);
  return Math.round((sum / loggedDays.length) * 10) / 10;
}
