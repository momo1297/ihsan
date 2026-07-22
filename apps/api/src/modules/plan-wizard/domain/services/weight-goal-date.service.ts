import { WeightGoalDirection } from "./tdee-calculator.service";

function shiftDate(dateStr: string, days: number): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(Date.UTC(year ?? 0, (month ?? 1) - 1, day ?? 1));
  date.setUTCDate(date.getUTCDate() + Math.round(days));
  return date.toISOString().slice(0, 10);
}

const DAYS_PER_MONTH = 30;

export interface WeightGoalDateInput {
  direction: WeightGoalDirection;
  startDate: string;
  startWeightKg: number;
  targetWeightKg: number | null;
  paceKgPerMonth: number | null;
}

/**
 * Projects a target date forward from a user-declared desired pace — the mirror image of
 * goal-projection-calculator's projectGoalDate, which works backward from observed history.
 * Returns null when there's no target/pace to project from, or the direction is MAINTAIN.
 */
export function computeWeightGoalTargetDate(input: WeightGoalDateInput): string | null {
  const { direction, startDate, startWeightKg, targetWeightKg, paceKgPerMonth } = input;
  if (direction === "MAINTAIN" || targetWeightKg == null || paceKgPerMonth == null || paceKgPerMonth <= 0) {
    return null;
  }

  const remaining = Math.abs(targetWeightKg - startWeightKg);
  if (remaining === 0) return startDate;

  const daysNeeded = (remaining / paceKgPerMonth) * DAYS_PER_MONTH;
  if (!Number.isFinite(daysNeeded) || daysNeeded < 0) return null;

  return shiftDate(startDate, daysNeeded);
}
