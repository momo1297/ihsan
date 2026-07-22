export type ExperienceLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
export type TrainingGoal = "STRENGTH" | "HYPERTROPHY" | "FAT_LOSS" | "GENERAL_FITNESS";
export type EquipmentAccess = "FULL_GYM" | "BASIC_HOME" | "BODYWEIGHT_ONLY";

export interface CatalogExercise {
  id: string;
  name: string;
  muscleGroup: string;
  equipment: string | null;
}

export interface SplitGeneratorInput {
  daysPerWeek: number;
  goal: TrainingGoal;
  equipmentAccess: EquipmentAccess;
  physicalRestrictions: string;
  exerciseCatalog: CatalogExercise[];
}

export interface GeneratedExerciseLine {
  exerciseId: string;
  exerciseName: string;
  order: number;
  targetSets: number;
  targetRepsMin: number;
  targetRepsMax: number;
  restSeconds: number;
}

export interface GeneratedDay {
  name: string;
  dayOrder: number;
  exercises: GeneratedExerciseLine[];
}

export interface SplitGeneratorResult {
  days: GeneratedDay[];
  warnings: string[];
}

type DayTemplate = { name: string; slots: { muscleGroup: string; armFocus?: "push" | "pull"; count: number }[] };

const FULL_BODY_SLOTS: DayTemplate["slots"] = [
  { muscleGroup: "Chest", count: 1 },
  { muscleGroup: "Back", count: 1 },
  { muscleGroup: "Legs", count: 1 },
  { muscleGroup: "Shoulders", count: 1 },
  { muscleGroup: "Arms", count: 1 },
  { muscleGroup: "Core", count: 1 },
];

const UPPER_SLOTS: DayTemplate["slots"] = [
  { muscleGroup: "Chest", count: 2 },
  { muscleGroup: "Back", count: 2 },
  { muscleGroup: "Shoulders", count: 1 },
  { muscleGroup: "Arms", count: 1 },
];

const LOWER_SLOTS: DayTemplate["slots"] = [
  { muscleGroup: "Legs", count: 3 },
  { muscleGroup: "Core", count: 1 },
];

const PUSH_SLOTS: DayTemplate["slots"] = [
  { muscleGroup: "Chest", count: 2 },
  { muscleGroup: "Shoulders", count: 2 },
  { muscleGroup: "Arms", armFocus: "push", count: 1 },
];

const PULL_SLOTS: DayTemplate["slots"] = [
  { muscleGroup: "Back", count: 3 },
  { muscleGroup: "Arms", armFocus: "pull", count: 1 },
];

const LEGS_SLOTS: DayTemplate["slots"] = [
  { muscleGroup: "Legs", count: 4 },
  { muscleGroup: "Core", count: 1 },
];

function fullBodyTemplates(count: number): DayTemplate[] {
  const letters = ["A", "B", "C", "D", "E", "F", "G"];
  return Array.from({ length: count }, (_, i) => ({
    name: count === 1 ? "Full Body" : `Full Body ${letters[i]}`,
    slots: FULL_BODY_SLOTS,
  }));
}

/** Day templates by days/week — a rotation, not tied to specific weekdays. */
function templatesForDaysPerWeek(daysPerWeek: number): DayTemplate[] {
  if (daysPerWeek <= 2) return fullBodyTemplates(daysPerWeek);
  if (daysPerWeek === 3) return fullBodyTemplates(3);
  if (daysPerWeek === 4) {
    return [
      { name: "Upper Body A", slots: UPPER_SLOTS },
      { name: "Lower Body A", slots: LOWER_SLOTS },
      { name: "Upper Body B", slots: UPPER_SLOTS },
      { name: "Lower Body B", slots: LOWER_SLOTS },
    ];
  }
  if (daysPerWeek === 5) {
    return [
      { name: "Push", slots: PUSH_SLOTS },
      { name: "Pull", slots: PULL_SLOTS },
      { name: "Legs", slots: LEGS_SLOTS },
      { name: "Upper Body", slots: UPPER_SLOTS },
      { name: "Lower Body", slots: LOWER_SLOTS },
    ];
  }
  if (daysPerWeek === 6) {
    return [
      { name: "Push A", slots: PUSH_SLOTS },
      { name: "Pull A", slots: PULL_SLOTS },
      { name: "Legs A", slots: LEGS_SLOTS },
      { name: "Push B", slots: PUSH_SLOTS },
      { name: "Pull B", slots: PULL_SLOTS },
      { name: "Legs B", slots: LEGS_SLOTS },
    ];
  }
  return [
    { name: "Push A", slots: PUSH_SLOTS },
    { name: "Pull A", slots: PULL_SLOTS },
    { name: "Legs A", slots: LEGS_SLOTS },
    { name: "Push B", slots: PUSH_SLOTS },
    { name: "Pull B", slots: PULL_SLOTS },
    { name: "Legs B", slots: LEGS_SLOTS },
    { name: "Full Body / Core", slots: FULL_BODY_SLOTS },
  ];
}

/** Curated pick order per muscle group, most important compound movements first. */
const EXERCISE_PRIORITY: Record<string, string[]> = {
  Chest: ["Bench Press", "Incline Bench Press", "Dumbbell Bench Press", "Push-Up", "Chest Fly"],
  Back: ["Deadlift", "Pull-Up", "Barbell Row", "Lat Pulldown", "Seated Cable Row", "T-Bar Row"],
  Legs: [
    "Squat",
    "Front Squat",
    "Leg Press",
    "Romanian Deadlift",
    "Lunges",
    "Bodyweight Squat",
    "Glute Bridge",
    "Leg Curl",
    "Leg Extension",
    "Calf Raise",
  ],
  Shoulders: ["Overhead Press", "Dumbbell Shoulder Press", "Pike Push-Up", "Lateral Raise", "Front Raise", "Face Pull"],
  ArmsPush: ["Tricep Pushdown", "Dips", "Skull Crusher"],
  ArmsPull: ["Barbell Curl", "Dumbbell Curl", "Hammer Curl"],
  ArmsGeneral: ["Barbell Curl", "Tricep Pushdown", "Dips", "Hammer Curl", "Dumbbell Curl", "Skull Crusher"],
  Core: ["Plank", "Hanging Leg Raise", "Cable Crunch", "Russian Twist", "Ab Wheel Rollout"],
};

/** Restriction keyword -> exercise names to exclude. Best-effort, always surfaced as a warning. */
const RESTRICTION_EXCLUSIONS: { keyword: string; excludedNames: string[] }[] = [
  { keyword: "knee", excludedNames: ["Squat", "Front Squat", "Lunges", "Leg Extension", "Bodyweight Squat"] },
  { keyword: "shoulder", excludedNames: ["Overhead Press", "Dumbbell Shoulder Press", "Pike Push-Up", "Front Raise"] },
  { keyword: "back", excludedNames: ["Deadlift", "Romanian Deadlift", "Barbell Row", "T-Bar Row"] },
  { keyword: "wrist", excludedNames: ["Barbell Curl", "Skull Crusher", "Front Squat"] },
];

const ALLOWED_EQUIPMENT: Record<EquipmentAccess, string[] | null> = {
  FULL_GYM: null,
  BASIC_HOME: ["Dumbbell", "Bodyweight", "Kettlebell"],
  BODYWEIGHT_ONLY: ["Bodyweight"],
};

const REPS_SCHEME_BY_GOAL: Record<TrainingGoal, { sets: number; repsMin: number; repsMax: number; restSeconds: number }> = {
  STRENGTH: { sets: 4, repsMin: 3, repsMax: 5, restSeconds: 150 },
  HYPERTROPHY: { sets: 3, repsMin: 8, repsMax: 12, restSeconds: 90 },
  FAT_LOSS: { sets: 3, repsMin: 12, repsMax: 15, restSeconds: 60 },
  GENERAL_FITNESS: { sets: 3, repsMin: 8, repsMax: 12, restSeconds: 90 },
};

function excludedExerciseNames(physicalRestrictions: string): Set<string> {
  const text = physicalRestrictions.toLowerCase();
  const excluded = new Set<string>();
  for (const rule of RESTRICTION_EXCLUSIONS) {
    if (text.includes(rule.keyword)) {
      rule.excludedNames.forEach((name) => excluded.add(name));
    }
  }
  return excluded;
}

function priorityKeyFor(muscleGroup: string, armFocus?: "push" | "pull"): string {
  if (muscleGroup !== "Arms") return muscleGroup;
  if (armFocus === "push") return "ArmsPush";
  if (armFocus === "pull") return "ArmsPull";
  return "ArmsGeneral";
}

export function generateTrainingSplit(input: SplitGeneratorInput): SplitGeneratorResult {
  const warnings: string[] = [];
  const excluded = excludedExerciseNames(input.physicalRestrictions);
  const allowedEquipment = ALLOWED_EQUIPMENT[input.equipmentAccess];

  const availableByName = new Map(input.exerciseCatalog.map((exercise) => [exercise.name, exercise]));
  const usedExerciseIdsThisDay = new Set<string>();

  function pickExercises(muscleGroup: string, armFocus: "push" | "pull" | undefined, count: number): CatalogExercise[] {
    const priorityKey = priorityKeyFor(muscleGroup, armFocus);
    const candidates = (EXERCISE_PRIORITY[priorityKey] ?? [])
      .map((name) => availableByName.get(name))
      .filter((exercise): exercise is CatalogExercise => {
        if (!exercise) return false;
        if (excluded.has(exercise.name)) return false;
        if (usedExerciseIdsThisDay.has(exercise.id)) return false;
        if (allowedEquipment && exercise.equipment && !allowedEquipment.includes(exercise.equipment)) return false;
        return true;
      });

    const picked = candidates.slice(0, count);
    picked.forEach((exercise) => usedExerciseIdsThisDay.add(exercise.id));
    if (picked.length < count) {
      warnings.push(
        `Not enough available exercises for ${muscleGroup}${armFocus ? ` (${armFocus})` : ""} given your equipment/restrictions — added what was available.`,
      );
    }
    return picked;
  }

  const templates = templatesForDaysPerWeek(input.daysPerWeek);
  const scheme = REPS_SCHEME_BY_GOAL[input.goal];

  const days: GeneratedDay[] = templates.map((template, dayIndex) => {
    usedExerciseIdsThisDay.clear();
    let order = 0;
    const exercises: GeneratedExerciseLine[] = [];

    for (const slot of template.slots) {
      const picked = pickExercises(slot.muscleGroup, slot.armFocus, slot.count);
      for (const exercise of picked) {
        exercises.push({
          exerciseId: exercise.id,
          exerciseName: exercise.name,
          order: order++,
          targetSets: scheme.sets,
          targetRepsMin: scheme.repsMin,
          targetRepsMax: scheme.repsMax,
          restSeconds: scheme.restSeconds,
        });
      }
    }

    return { name: template.name, dayOrder: dayIndex, exercises };
  });

  return { days, warnings: Array.from(new Set(warnings)) };
}
