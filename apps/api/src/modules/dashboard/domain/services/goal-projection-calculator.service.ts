function shiftDate(dateStr: string, days: number): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(Date.UTC(year ?? 0, (month ?? 1) - 1, day ?? 1));
  date.setUTCDate(date.getUTCDate() + Math.round(days));
  return date.toISOString().slice(0, 10);
}

function daysBetween(fromDateStr: string, toDateStr: string): number {
  const [fy, fm, fd] = fromDateStr.split("-").map(Number);
  const [ty, tm, td] = toDateStr.split("-").map(Number);
  const from = Date.UTC(fy ?? 0, (fm ?? 1) - 1, fd ?? 1);
  const to = Date.UTC(ty ?? 0, (tm ?? 1) - 1, td ?? 1);
  return Math.round((to - from) / (1000 * 60 * 60 * 24));
}

export interface GoalProjectionInput {
  currentWeightKg: number;
  currentDate: string;
  startWeightKg: number;
  startDate: string;
  targetWeightKg: number;
}

/**
 * Projects when the goal is reached at the rate of change observed since the goal started.
 * Returns null when there isn't enough history yet, progress is flat, or it's moving away from the target.
 */
export function projectGoalDate(input: GoalProjectionInput): string | null {
  const { currentWeightKg, currentDate, startWeightKg, startDate, targetWeightKg } = input;

  const remaining = targetWeightKg - currentWeightKg;
  if (remaining === 0) return currentDate;

  const daysSinceStart = daysBetween(startDate, currentDate);
  if (daysSinceStart <= 0) return null;

  const ratePerDay = (currentWeightKg - startWeightKg) / daysSinceStart;
  if (ratePerDay === 0 || Math.sign(remaining) !== Math.sign(ratePerDay)) return null;

  const daysToGoal = remaining / ratePerDay;
  if (!Number.isFinite(daysToGoal) || daysToGoal < 0) return null;

  return shiftDate(currentDate, daysToGoal);
}
