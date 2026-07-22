import { selectNextWorkoutDay } from "./next-workout-day-selector.service";
import { WorkoutDayLine } from "../entities/program.entity";

function makeDay(id: string, dayOrder: number): WorkoutDayLine {
  return { id, name: `Day ${dayOrder}`, dayOrder, exercises: [] };
}

describe("selectNextWorkoutDay", () => {
  it("returns null for an empty program", () => {
    expect(selectNextWorkoutDay([], null)).toBeNull();
  });

  it("returns the first day (by dayOrder) when nothing has been trained yet", () => {
    const days = [makeDay("c", 3), makeDay("a", 1), makeDay("b", 2)];
    expect(selectNextWorkoutDay(days, null)?.id).toBe("a");
  });

  it("returns the next day in rotation after the last trained day", () => {
    const days = [makeDay("a", 1), makeDay("b", 2), makeDay("c", 3)];
    expect(selectNextWorkoutDay(days, "a")?.id).toBe("b");
    expect(selectNextWorkoutDay(days, "b")?.id).toBe("c");
  });

  it("wraps back to the first day after the last one in the rotation", () => {
    const days = [makeDay("a", 1), makeDay("b", 2), makeDay("c", 3)];
    expect(selectNextWorkoutDay(days, "c")?.id).toBe("a");
  });

  it("falls back to the first day if the last trained day no longer exists in the program", () => {
    const days = [makeDay("a", 1), makeDay("b", 2)];
    expect(selectNextWorkoutDay(days, "deleted-day")?.id).toBe("a");
  });
});
