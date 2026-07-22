import { buildLastNDays, countCompletedWorkouts, averageCalories } from "./weekly-rollup-calculator.service";

describe("buildLastNDays", () => {
  it("returns N calendar dates ending with today, oldest first", () => {
    const days = buildLastNDays("2026-07-22", 7);
    expect(days).toEqual([
      "2026-07-16",
      "2026-07-17",
      "2026-07-18",
      "2026-07-19",
      "2026-07-20",
      "2026-07-21",
      "2026-07-22",
    ]);
  });

  it("rolls back across a month boundary", () => {
    const days = buildLastNDays("2026-03-02", 3);
    expect(days).toEqual(["2026-02-28", "2026-03-01", "2026-03-02"]);
  });
});

describe("countCompletedWorkouts", () => {
  it("counts only sessions with a completedAt", () => {
    const sessions = [{ completedAt: new Date() }, { completedAt: null }, { completedAt: new Date() }];
    expect(countCompletedWorkouts(sessions)).toBe(2);
  });
});

describe("averageCalories", () => {
  it("returns null when no day has any logged calories", () => {
    expect(averageCalories([0, 0, 0])).toBeNull();
  });

  it("averages only over days with logged calories", () => {
    expect(averageCalories([2000, 0, 2200, 0, 1800])).toBeCloseTo(2000, 1);
  });
});
