import { calculateBodyFatPercent, calculateLeanMassKg } from "./body-composition-calculator.service";

describe("calculateBodyFatPercent", () => {
  it("computes a plausible estimate for a male using the Navy formula", () => {
    const result = calculateBodyFatPercent({ sex: "MALE", heightCm: 180, waistCm: 85, neckCm: 38 });
    expect(result).not.toBeNull();
    expect(result).toBeGreaterThan(3);
    expect(result).toBeLessThan(60);
  });

  it("computes a plausible estimate for a female using the Navy formula", () => {
    const result = calculateBodyFatPercent({ sex: "FEMALE", heightCm: 165, waistCm: 75, neckCm: 32, hipsCm: 95 });
    expect(result).not.toBeNull();
    expect(result).toBeGreaterThan(3);
    expect(result).toBeLessThan(60);
  });

  it("returns null for a male when the waist isn't larger than the neck", () => {
    const result = calculateBodyFatPercent({ sex: "MALE", heightCm: 180, waistCm: 35, neckCm: 38 });
    expect(result).toBeNull();
  });

  it("returns null for a female missing hips", () => {
    const result = calculateBodyFatPercent({ sex: "FEMALE", heightCm: 165, waistCm: 75, neckCm: 32 });
    expect(result).toBeNull();
  });

  it("returns null when waist + hips isn't larger than the neck", () => {
    const result = calculateBodyFatPercent({ sex: "FEMALE", heightCm: 165, waistCm: 10, neckCm: 32, hipsCm: 10 });
    expect(result).toBeNull();
  });
});

describe("calculateLeanMassKg", () => {
  it("subtracts fat mass from total weight", () => {
    expect(calculateLeanMassKg(80, 20)).toBe(64);
  });

  it("rounds to one decimal", () => {
    expect(calculateLeanMassKg(83.3, 17)).toBeCloseTo(69.1, 1);
  });
});
