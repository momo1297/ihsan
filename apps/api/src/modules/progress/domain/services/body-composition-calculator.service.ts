export type BiologicalSex = "MALE" | "FEMALE";

export interface BodyFatInput {
  sex: BiologicalSex;
  heightCm: number;
  waistCm: number;
  neckCm: number;
  hipsCm?: number | null;
}

/** Physiologically implausible results (bad inputs, e.g. a waist smaller than a neck) are rejected as null. */
const MIN_PLAUSIBLE_BODY_FAT_PERCENT = 3;
const MAX_PLAUSIBLE_BODY_FAT_PERCENT = 60;

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

/** U.S. Navy circumference method. Returns null when required measurements are missing or the result is implausible. */
export function calculateBodyFatPercent(input: BodyFatInput): number | null {
  const { sex, heightCm, waistCm, neckCm, hipsCm } = input;

  let bodyFatPercent: number;
  if (sex === "MALE") {
    if (waistCm <= neckCm) return null;
    bodyFatPercent =
      495 / (1.0324 - 0.19077 * Math.log10(waistCm - neckCm) + 0.15456 * Math.log10(heightCm)) - 450;
  } else {
    if (hipsCm == null || waistCm + hipsCm <= neckCm) return null;
    bodyFatPercent =
      495 / (1.29579 - 0.35004 * Math.log10(waistCm + hipsCm - neckCm) + 0.221 * Math.log10(heightCm)) - 450;
  }

  if (
    !Number.isFinite(bodyFatPercent) ||
    bodyFatPercent < MIN_PLAUSIBLE_BODY_FAT_PERCENT ||
    bodyFatPercent > MAX_PLAUSIBLE_BODY_FAT_PERCENT
  ) {
    return null;
  }
  return round1(bodyFatPercent);
}

export function calculateLeanMassKg(weightKg: number, bodyFatPercent: number): number {
  return round1(weightKg * (1 - bodyFatPercent / 100));
}
