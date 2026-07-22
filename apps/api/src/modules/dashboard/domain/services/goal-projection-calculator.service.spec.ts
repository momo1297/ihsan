import { projectGoalDate } from "./goal-projection-calculator.service";

describe("projectGoalDate", () => {
  it("returns the current date when the target is already reached", () => {
    const result = projectGoalDate({
      currentWeightKg: 80,
      currentDate: "2026-07-22",
      startWeightKg: 85,
      startDate: "2026-06-01",
      targetWeightKg: 80,
    });
    expect(result).toBe("2026-07-22");
  });

  it("returns null when there's no history yet (start date is today or later)", () => {
    const result = projectGoalDate({
      currentWeightKg: 85,
      currentDate: "2026-07-22",
      startWeightKg: 85,
      startDate: "2026-07-22",
      targetWeightKg: 80,
    });
    expect(result).toBeNull();
  });

  it("returns null when weight hasn't changed since the goal started", () => {
    const result = projectGoalDate({
      currentWeightKg: 85,
      currentDate: "2026-07-22",
      startWeightKg: 85,
      startDate: "2026-06-22",
      targetWeightKg: 80,
    });
    expect(result).toBeNull();
  });

  it("returns null when moving away from the target", () => {
    const result = projectGoalDate({
      currentWeightKg: 87,
      currentDate: "2026-07-22",
      startWeightKg: 85,
      startDate: "2026-06-22",
      targetWeightKg: 80,
    });
    expect(result).toBeNull();
  });

  it("projects a future date at the observed rate of loss", () => {
    // Lost 2kg over 30 days -> -1/15 kg/day. Needs 5kg more -> 75 days.
    const result = projectGoalDate({
      currentWeightKg: 83,
      currentDate: "2026-07-22",
      startWeightKg: 85,
      startDate: "2026-06-22",
      targetWeightKg: 78,
    });
    expect(result).toBe("2026-10-05");
  });
});
