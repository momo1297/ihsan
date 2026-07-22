import { calculateMacroTargets } from "./tdee-calculator.service";

describe("calculateMacroTargets", () => {
  it("computes higher TDEE for a physical job with more training days than a sedentary job with none", () => {
    const sedentary = calculateMacroTargets({
      sex: "MALE",
      age: 30,
      heightCm: 180,
      weightKg: 80,
      jobType: "SEDENTARY",
      daysPerWeek: 0,
      goalDirection: "MAINTAIN",
    });
    const physical = calculateMacroTargets({
      sex: "MALE",
      age: 30,
      heightCm: 180,
      weightKg: 80,
      jobType: "PHYSICAL",
      daysPerWeek: 6,
      goalDirection: "MAINTAIN",
    });
    expect(physical.calories).toBeGreaterThan(sedentary.calories);
  });

  it("subtracts a deficit for LOSE and adds a surplus for GAIN relative to MAINTAIN", () => {
    const base = { sex: "FEMALE" as const, age: 28, heightCm: 165, weightKg: 65, jobType: "MODERATE" as const, daysPerWeek: 4 };
    const maintain = calculateMacroTargets({ ...base, goalDirection: "MAINTAIN" });
    const lose = calculateMacroTargets({ ...base, goalDirection: "LOSE" });
    const gain = calculateMacroTargets({ ...base, goalDirection: "GAIN" });

    expect(lose.calories).toBeLessThan(maintain.calories);
    expect(gain.calories).toBeGreaterThan(maintain.calories);
  });

  it("never goes below the safety floor even for an aggressive deficit on a small frame", () => {
    const result = calculateMacroTargets({
      sex: "FEMALE",
      age: 60,
      heightCm: 150,
      weightKg: 45,
      jobType: "SEDENTARY",
      daysPerWeek: 0,
      goalDirection: "LOSE",
    });
    expect(result.calories).toBeGreaterThanOrEqual(1200);
  });

  it("scales protein target with bodyweight", () => {
    const light = calculateMacroTargets({
      sex: "MALE",
      age: 25,
      heightCm: 175,
      weightKg: 70,
      jobType: "MODERATE",
      daysPerWeek: 3,
      goalDirection: "MAINTAIN",
    });
    const heavy = calculateMacroTargets({
      sex: "MALE",
      age: 25,
      heightCm: 175,
      weightKg: 100,
      jobType: "MODERATE",
      daysPerWeek: 3,
      goalDirection: "MAINTAIN",
    });
    expect(heavy.proteinGrams).toBeGreaterThan(light.proteinGrams);
  });

  it("keeps calories consistent with protein/fat/carb macro breakdown (within rounding)", () => {
    const result = calculateMacroTargets({
      sex: "MALE",
      age: 30,
      heightCm: 180,
      weightKg: 80,
      jobType: "MODERATE",
      daysPerWeek: 4,
      goalDirection: "MAINTAIN",
    });
    const caloriesFromMacros = result.proteinGrams * 4 + result.carbsGrams * 4 + result.fatGrams * 9;
    expect(Math.abs(caloriesFromMacros - result.calories)).toBeLessThanOrEqual(5);
  });
});
