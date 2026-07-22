import { WorkoutDayLine } from "../entities/program.entity";

/**
 * Programs are day-order rotations, not weekday-bound schedules — so "today's day" is whichever
 * day comes after the last one actually trained, wrapping back to the start of the rotation.
 */
export function selectNextWorkoutDay(
  days: WorkoutDayLine[],
  lastTrainedWorkoutDayId: string | null,
): WorkoutDayLine | null {
  if (days.length === 0) return null;
  const sorted = [...days].sort((a, b) => a.dayOrder - b.dayOrder);
  if (!lastTrainedWorkoutDayId) return sorted[0] ?? null;

  const lastIndex = sorted.findIndex((day) => day.id === lastTrainedWorkoutDayId);
  if (lastIndex === -1) return sorted[0] ?? null;

  return sorted[(lastIndex + 1) % sorted.length] ?? null;
}
