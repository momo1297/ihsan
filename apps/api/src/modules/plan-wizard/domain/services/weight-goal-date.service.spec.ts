import { computeWeightGoalTargetDate } from "./weight-goal-date.service";

describe("computeWeightGoalTargetDate", () => {
  it("returns null for MAINTAIN", () => {
    const result = computeWeightGoalTargetDate({
      direction: "MAINTAIN",
      startDate: "2026-01-01",
      startWeightKg: 80,
      targetWeightKg: 80,
      paceKgPerMonth: 2,
    });
    expect(result).toBeNull();
  });

  it("returns null when no target weight or pace is given", () => {
    expect(
      computeWeightGoalTargetDate({
        direction: "GAIN",
        startDate: "2026-01-01",
        startWeightKg: 70,
        targetWeightKg: null,
        paceKgPerMonth: 2,
      }),
    ).toBeNull();
    expect(
      computeWeightGoalTargetDate({
        direction: "GAIN",
        startDate: "2026-01-01",
        startWeightKg: 70,
        targetWeightKg: 80,
        paceKgPerMonth: null,
      }),
    ).toBeNull();
  });

  it("projects a target date forward at 2kg/month for a 4kg gain", () => {
    const result = computeWeightGoalTargetDate({
      direction: "GAIN",
      startDate: "2026-01-01",
      startWeightKg: 70,
      targetWeightKg: 74,
      paceKgPerMonth: 2,
    });
    // 4kg at 2kg/month = 2 months = 60 days
    expect(result).toBe("2026-03-02");
  });

  it("works the same direction-agnostically for LOSE (uses absolute distance)", () => {
    const result = computeWeightGoalTargetDate({
      direction: "LOSE",
      startDate: "2026-01-01",
      startWeightKg: 90,
      targetWeightKg: 86,
      paceKgPerMonth: 2,
    });
    // 4kg at 2kg/month = 2 months = 60 days
    expect(result).toBe("2026-03-02");
  });

  it("returns the start date immediately when already at the target", () => {
    const result = computeWeightGoalTargetDate({
      direction: "GAIN",
      startDate: "2026-01-01",
      startWeightKg: 80,
      targetWeightKg: 80,
      paceKgPerMonth: 2,
    });
    expect(result).toBe("2026-01-01");
  });
});
