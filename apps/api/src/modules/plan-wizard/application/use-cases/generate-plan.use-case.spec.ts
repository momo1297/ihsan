import { ExerciseEntity } from "../../../training/domain/entities/exercise.entity";
import { RecipeEntity } from "../../../nutrition/domain/entities/recipe.entity";
import { ListExercisesUseCase } from "../../../training/application/use-cases/list-exercises.use-case";
import { ListRecipesUseCase } from "../../../nutrition/application/use-cases/list-recipes.use-case";
import { GeneratePlanUseCase, PlanIntake } from "./generate-plan.use-case";

const EXERCISES: ExerciseEntity[] = [
  new ExerciseEntity("1", null, "Bench Press", "Chest", "Barbell", new Date()),
  new ExerciseEntity("2", null, "Barbell Row", "Back", "Barbell", new Date()),
  new ExerciseEntity("3", null, "Squat", "Legs", "Barbell", new Date()),
  new ExerciseEntity("4", null, "Plank", "Core", "Bodyweight", new Date()),
];

const RECIPES: RecipeEntity[] = [
  new RecipeEntity("r1", "user-1", "Tofu scramble", 1, null, "BREAKFAST", ["vegetarian", "vegan"], [], new Date()),
  new RecipeEntity("r2", "user-1", "Tofu quinoa bowl", 1, null, "LUNCH", ["vegetarian", "vegan"], [], new Date()),
  new RecipeEntity("r3", "user-1", "Chickpea spinach stew", 1, null, "DINNER", ["vegetarian", "vegan"], [], new Date()),
];

function makeUseCase() {
  const listExercises = { execute: async () => EXERCISES } as unknown as ListExercisesUseCase;
  const listRecipes = { execute: async () => RECIPES } as unknown as ListRecipesUseCase;
  return new GeneratePlanUseCase(listExercises, listRecipes);
}

function baseIntake(overrides: Partial<PlanIntake> = {}): PlanIntake {
  return {
    daysPerWeek: 3,
    experienceLevel: "INTERMEDIATE",
    trainingGoal: "HYPERTROPHY",
    physicalRestrictions: "",
    equipmentAccess: "FULL_GYM",
    jobType: "MODERATE",
    dietaryRestrictions: [],
    otherDietaryNotes: "",
    mealsPerDay: 3,
    weightGoalDirection: "MAINTAIN",
    targetWeightKg: null,
    age: 30,
    currentWeightKg: 80,
    heightCm: 180,
    sex: "MALE",
    ...overrides,
  };
}

describe("GeneratePlanUseCase", () => {
  it("generates a program with the requested number of days", async () => {
    const useCase = makeUseCase();
    const result = await useCase.execute("user-1", baseIntake({ daysPerWeek: 3 }));
    expect(result.program.days).toHaveLength(3);
  });

  it("computes a nutrition target from the intake body stats", async () => {
    const useCase = makeUseCase();
    const result = await useCase.execute("user-1", baseIntake());
    expect(result.nutritionTarget.calories).toBeGreaterThan(0);
    expect(result.nutritionTarget.proteinGrams).toBeGreaterThan(0);
  });

  it("filters meal suggestions by dietary restriction", async () => {
    const useCase = makeUseCase();
    const result = await useCase.execute("user-1", baseIntake({ dietaryRestrictions: ["VEGAN"] }));
    expect(result.mealSuggestions.breakfast.map((r) => r.name)).toContain("Tofu scramble");
  });

  it("returns null weightGoal when the direction is MAINTAIN", async () => {
    const useCase = makeUseCase();
    const result = await useCase.execute("user-1", baseIntake({ weightGoalDirection: "MAINTAIN" }));
    expect(result.weightGoal).toBeNull();
  });

  it("proposes a weight goal with start/target values when losing or gaining", async () => {
    const useCase = makeUseCase();
    const result = await useCase.execute(
      "user-1",
      baseIntake({ weightGoalDirection: "LOSE", currentWeightKg: 85, targetWeightKg: 78 }),
    );
    expect(result.weightGoal).toEqual({ direction: "LOSE", startValue: 85, targetValue: 78 });
  });

  it("adds a beginner-specific note", async () => {
    const useCase = makeUseCase();
    const result = await useCase.execute("user-1", baseIntake({ experienceLevel: "BEGINNER" }));
    expect(result.notes.some((note) => note.toLowerCase().includes("beginner"))).toBe(true);
  });
});
