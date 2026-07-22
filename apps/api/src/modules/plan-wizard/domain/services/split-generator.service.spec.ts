import { CatalogExercise, generateTrainingSplit } from "./split-generator.service";

const CATALOG: CatalogExercise[] = [
  { id: "1", name: "Bench Press", muscleGroup: "Chest", equipment: "Barbell" },
  { id: "2", name: "Push-Up", muscleGroup: "Chest", equipment: "Bodyweight" },
  { id: "3", name: "Deadlift", muscleGroup: "Back", equipment: "Barbell" },
  { id: "4", name: "Pull-Up", muscleGroup: "Back", equipment: "Bodyweight" },
  { id: "5", name: "Squat", muscleGroup: "Legs", equipment: "Barbell" },
  { id: "6", name: "Bodyweight Squat", muscleGroup: "Legs", equipment: "Bodyweight" },
  { id: "7", name: "Overhead Press", muscleGroup: "Shoulders", equipment: "Barbell" },
  { id: "8", name: "Pike Push-Up", muscleGroup: "Shoulders", equipment: "Bodyweight" },
  { id: "9", name: "Barbell Curl", muscleGroup: "Arms", equipment: "Barbell" },
  { id: "10", name: "Tricep Pushdown", muscleGroup: "Arms", equipment: "Cable" },
  { id: "11", name: "Dips", muscleGroup: "Arms", equipment: "Bodyweight" },
  { id: "12", name: "Plank", muscleGroup: "Core", equipment: "Bodyweight" },
];

function baseInput(overrides: Partial<Parameters<typeof generateTrainingSplit>[0]> = {}) {
  return {
    daysPerWeek: 3,
    goal: "HYPERTROPHY" as const,
    equipmentAccess: "FULL_GYM" as const,
    physicalRestrictions: "",
    exerciseCatalog: CATALOG,
    ...overrides,
  };
}

describe("generateTrainingSplit", () => {
  it("generates one day per requested day count", () => {
    const result = generateTrainingSplit(baseInput({ daysPerWeek: 4 }));
    expect(result.days).toHaveLength(4);
  });

  it("uses a push/pull/legs pattern for 6 days a week", () => {
    const result = generateTrainingSplit(baseInput({ daysPerWeek: 6 }));
    expect(result.days.map((d) => d.name)).toEqual(["Push A", "Pull A", "Legs A", "Push B", "Pull B", "Legs B"]);
  });

  it("applies the goal's rep scheme to every exercise", () => {
    const result = generateTrainingSplit(baseInput({ goal: "STRENGTH" }));
    for (const day of result.days) {
      for (const exercise of day.exercises) {
        expect(exercise.targetRepsMin).toBe(3);
        expect(exercise.targetRepsMax).toBe(5);
        expect(exercise.targetSets).toBe(4);
      }
    }
  });

  it("only selects bodyweight exercises when equipment access is bodyweight-only", () => {
    const result = generateTrainingSplit(baseInput({ equipmentAccess: "BODYWEIGHT_ONLY" }));
    const usedIds = result.days.flatMap((day) => day.exercises.map((e) => e.exerciseId));
    const usedExercises = CATALOG.filter((e) => usedIds.includes(e.id));
    expect(usedExercises.every((e) => e.equipment === "Bodyweight")).toBe(true);
  });

  it("excludes knee-loading exercises when a knee restriction is mentioned", () => {
    const result = generateTrainingSplit(baseInput({ physicalRestrictions: "bad knee, avoid squats" }));
    const usedNames = result.days.flatMap((day) => day.exercises.map((e) => e.exerciseName));
    expect(usedNames).not.toContain("Squat");
    expect(usedNames).not.toContain("Bodyweight Squat");
  });

  it("warns instead of throwing when a slot has no available exercises", () => {
    const tinyCatalog: CatalogExercise[] = [{ id: "1", name: "Push-Up", muscleGroup: "Chest", equipment: "Bodyweight" }];
    const result = generateTrainingSplit(baseInput({ daysPerWeek: 1, exerciseCatalog: tinyCatalog }));
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.days[0]!.exercises.length).toBeGreaterThan(0);
  });

  it("never repeats the same exercise twice within one day", () => {
    const result = generateTrainingSplit(baseInput({ daysPerWeek: 5 }));
    for (const day of result.days) {
      const ids = day.exercises.map((e) => e.exerciseId);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });
});
