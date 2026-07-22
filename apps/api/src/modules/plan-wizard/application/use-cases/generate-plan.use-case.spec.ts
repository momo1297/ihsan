import { ExerciseEntity } from "../../../training/domain/entities/exercise.entity";
import { RecipeEntity } from "../../../nutrition/domain/entities/recipe.entity";
import { ListExercisesUseCase } from "../../../training/application/use-cases/list-exercises.use-case";
import { ListRecipesUseCase } from "../../../nutrition/application/use-cases/list-recipes.use-case";
import { AiPlanContentService } from "../services/ai-plan-content.service";
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

function makeUseCase(aiPlanContent?: Partial<AiPlanContentService>) {
  const listExercises = { execute: async () => EXERCISES } as unknown as ListExercisesUseCase;
  const listRecipes = { execute: async () => RECIPES } as unknown as ListRecipesUseCase;
  const ai = (aiPlanContent ?? { generate: async () => { throw new Error("no AI in tests by default"); } }) as AiPlanContentService;
  return new GeneratePlanUseCase(listExercises, listRecipes, ai);
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
    programDurationWeeks: 8,
    otherActivities: [],
    weightChangePaceKgPerMonth: null,
    ...overrides,
  };
}

describe("GeneratePlanUseCase", () => {
  const originalApiKey = process.env.OPENROUTER_API_KEY;

  afterEach(() => {
    process.env.OPENROUTER_API_KEY = originalApiKey;
  });

  it("generates a program with the requested number of days", async () => {
    delete process.env.OPENROUTER_API_KEY;
    const useCase = makeUseCase();
    const result = await useCase.execute("user-1", baseIntake({ daysPerWeek: 3 }));
    expect(result.program.days).toHaveLength(3);
    expect(result.aiGenerated).toBe(false);
  });

  it("computes a nutrition target from the intake body stats", async () => {
    delete process.env.OPENROUTER_API_KEY;
    const useCase = makeUseCase();
    const result = await useCase.execute("user-1", baseIntake());
    expect(result.nutritionTarget.calories).toBeGreaterThan(0);
    expect(result.nutritionTarget.proteinGrams).toBeGreaterThan(0);
  });

  it("filters meal suggestions by dietary restriction", async () => {
    delete process.env.OPENROUTER_API_KEY;
    const useCase = makeUseCase();
    const result = await useCase.execute("user-1", baseIntake({ dietaryRestrictions: ["VEGAN"] }));
    expect(result.mealSuggestions.breakfast.map((r) => r.name)).toContain("Tofu scramble");
  });

  it("returns null weightGoal when the direction is MAINTAIN", async () => {
    delete process.env.OPENROUTER_API_KEY;
    const useCase = makeUseCase();
    const result = await useCase.execute("user-1", baseIntake({ weightGoalDirection: "MAINTAIN" }));
    expect(result.weightGoal).toBeNull();
  });

  it("proposes a weight goal with start/target values (and no target date without a pace) when losing or gaining", async () => {
    delete process.env.OPENROUTER_API_KEY;
    const useCase = makeUseCase();
    const result = await useCase.execute(
      "user-1",
      baseIntake({ weightGoalDirection: "LOSE", currentWeightKg: 85, targetWeightKg: 78 }),
    );
    expect(result.weightGoal).toEqual({ direction: "LOSE", startValue: 85, targetValue: 78, targetDate: null });
  });

  it("computes a target date for the weight goal when a pace is given", async () => {
    delete process.env.OPENROUTER_API_KEY;
    const useCase = makeUseCase();
    const result = await useCase.execute(
      "user-1",
      baseIntake({
        weightGoalDirection: "GAIN",
        currentWeightKg: 70,
        targetWeightKg: 74,
        weightChangePaceKgPerMonth: 2,
      }),
    );
    expect(result.weightGoal?.targetDate).not.toBeNull();
  });

  it("adds a beginner-specific note", async () => {
    delete process.env.OPENROUTER_API_KEY;
    const useCase = makeUseCase();
    const result = await useCase.execute("user-1", baseIntake({ experienceLevel: "BEGINNER" }));
    expect(result.notes.some((note) => note.toLowerCase().includes("beginner"))).toBe(true);
  });

  it("skips the AI path entirely when no OPENROUTER_API_KEY is configured", async () => {
    delete process.env.OPENROUTER_API_KEY;
    const generate = jest.fn();
    const useCase = makeUseCase({ generate });
    await useCase.execute("user-1", baseIntake());
    expect(generate).not.toHaveBeenCalled();
  });

  it("uses the AI-generated content and sets aiGenerated when the AI path succeeds", async () => {
    process.env.OPENROUTER_API_KEY = "test-key";
    const aiDays = [{ name: "AI Day", dayOrder: 0, exercises: [] }];
    const aiMealSuggestions = { breakfast: [], lunch: [], dinner: [], snack: [], warnings: [] };
    const useCase = makeUseCase({
      generate: async () => ({ days: aiDays, mealSuggestions: aiMealSuggestions, notes: ["AI note"] }),
    });
    const result = await useCase.execute("user-1", baseIntake());
    expect(result.aiGenerated).toBe(true);
    expect(result.program.days).toEqual(aiDays);
    expect(result.notes).toContain("AI note");
  });

  it("falls back to the deterministic generator and notes it when the AI path throws", async () => {
    process.env.OPENROUTER_API_KEY = "test-key";
    const useCase = makeUseCase({
      generate: async () => {
        throw new Error("LLM unavailable");
      },
    });
    const result = await useCase.execute("user-1", baseIntake({ daysPerWeek: 3 }));
    expect(result.aiGenerated).toBe(false);
    expect(result.program.days).toHaveLength(3);
    expect(result.notes.some((note) => note.includes("AI-personalized coaching was unavailable"))).toBe(true);
  });
});
