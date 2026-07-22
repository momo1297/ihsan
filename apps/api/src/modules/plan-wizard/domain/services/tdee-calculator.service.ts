export type BiologicalSex = "MALE" | "FEMALE";
export type JobType = "SEDENTARY" | "MODERATE" | "PHYSICAL";
export type WeightGoalDirection = "LOSE" | "GAIN" | "MAINTAIN";

export interface TdeeInput {
  sex: BiologicalSex;
  age: number;
  heightCm: number;
  weightKg: number;
  jobType: JobType;
  daysPerWeek: number;
  goalDirection: WeightGoalDirection;
  /** Desired rate of weight change. When omitted, falls back to a fixed 500/300 kcal deficit/surplus. */
  weightChangePaceKgPerMonth?: number | null;
}

export interface MacroTargets {
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
}

/** Sedentary / light exercise / moderate / heavy / athlete — standard TDEE activity multiplier steps. */
const ACTIVITY_MULTIPLIERS = [1.2, 1.375, 1.55, 1.725, 1.9];

const MIN_CALORIES = 1200;
const PROTEIN_GRAMS_PER_KG = 1.8;
const FAT_SHARE_OF_CALORIES = 0.25;
const CALORIES_PER_GRAM_PROTEIN = 4;
const CALORIES_PER_GRAM_CARB = 4;
const CALORIES_PER_GRAM_FAT = 9;
const LOSE_DEFICIT_CALORIES = 500;
const GAIN_SURPLUS_CALORIES = 300;

const KCAL_PER_KG_BODY_MASS = 7700;
const DAYS_PER_MONTH = 30;
const MIN_DAILY_CALORIE_DELTA = 150;
const MAX_DAILY_CALORIE_DELTA = 1000;

/** Converts a desired rate of weight change into a daily calorie deficit/surplus, clamped to a safe range. */
export function paceToDailyCalorieDelta(paceKgPerMonth: number): number {
  const rawDelta = (paceKgPerMonth * KCAL_PER_KG_BODY_MASS) / DAYS_PER_MONTH;
  return Math.min(MAX_DAILY_CALORIE_DELTA, Math.max(MIN_DAILY_CALORIE_DELTA, Math.round(rawDelta)));
}

function calculateBmr(sex: BiologicalSex, weightKg: number, heightCm: number, age: number): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return sex === "MALE" ? base + 5 : base - 161;
}

function jobTypeTier(jobType: JobType): number {
  switch (jobType) {
    case "SEDENTARY":
      return 0;
    case "MODERATE":
      return 1;
    case "PHYSICAL":
      return 2;
  }
}

function trainingDaysTier(daysPerWeek: number): number {
  if (daysPerWeek <= 0) return 0;
  if (daysPerWeek <= 3) return 1;
  if (daysPerWeek <= 5) return 2;
  return 3;
}

function activityMultiplier(jobType: JobType, daysPerWeek: number): number {
  const tier = Math.min(jobTypeTier(jobType) + trainingDaysTier(daysPerWeek), ACTIVITY_MULTIPLIERS.length - 1);
  return ACTIVITY_MULTIPLIERS[tier]!;
}

/** Mifflin-St Jeor BMR, TDEE via an activity multiplier from job type + training frequency, then a goal adjustment. */
export function calculateMacroTargets(input: TdeeInput): MacroTargets {
  const bmr = calculateBmr(input.sex, input.weightKg, input.heightCm, input.age);
  const tdee = bmr * activityMultiplier(input.jobType, input.daysPerWeek);

  const dailyDelta =
    input.weightChangePaceKgPerMonth != null ? paceToDailyCalorieDelta(input.weightChangePaceKgPerMonth) : null;

  let calories = tdee;
  if (input.goalDirection === "LOSE") calories -= dailyDelta ?? LOSE_DEFICIT_CALORIES;
  if (input.goalDirection === "GAIN") calories += dailyDelta ?? GAIN_SURPLUS_CALORIES;
  calories = Math.max(MIN_CALORIES, Math.round(calories));

  const proteinGrams = Math.round(input.weightKg * PROTEIN_GRAMS_PER_KG);
  const fatGrams = Math.round((calories * FAT_SHARE_OF_CALORIES) / CALORIES_PER_GRAM_FAT);
  const remainingCalories = calories - proteinGrams * CALORIES_PER_GRAM_PROTEIN - fatGrams * CALORIES_PER_GRAM_FAT;
  const carbsGrams = Math.max(0, Math.round(remainingCalories / CALORIES_PER_GRAM_CARB));

  return { calories, proteinGrams, carbsGrams, fatGrams };
}
