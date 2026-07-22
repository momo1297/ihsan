import { calculateWeeklyCompletionPercent } from "./habit-completion-calculator.service";

const DAYS = ["2026-07-16", "2026-07-17", "2026-07-18", "2026-07-19", "2026-07-20", "2026-07-21", "2026-07-22"];

describe("calculateWeeklyCompletionPercent", () => {
  it("returns 0 when there are no active habits", () => {
    expect(calculateWeeklyCompletionPercent([], DAYS)).toBe(0);
  });

  it("returns 100 when every habit was completed every day", () => {
    const habits = [{ completedDates: [...DAYS] }, { completedDates: [...DAYS] }];
    expect(calculateWeeklyCompletionPercent(habits, DAYS)).toBe(100);
  });

  it("computes a partial percentage across multiple habits", () => {
    // habit A: 7/7, habit B: 0/7 -> 7/14 = 50%
    const habits = [{ completedDates: [...DAYS] }, { completedDates: [] }];
    expect(calculateWeeklyCompletionPercent(habits, DAYS)).toBe(50);
  });

  it("ignores completions outside the given day window", () => {
    const habits = [{ completedDates: ["2020-01-01"] }];
    expect(calculateWeeklyCompletionPercent(habits, DAYS)).toBe(0);
  });
});
