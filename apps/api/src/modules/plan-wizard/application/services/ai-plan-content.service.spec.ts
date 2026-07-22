import { AiPlanContentService, AiPlanContentInput } from "./ai-plan-content.service";
import { LlmClientPort, LlmCompletionResult } from "../../../ai-coach/application/ports/llm-client.port";
import { CatalogExercise } from "../../domain/services/split-generator.service";
import { CatalogRecipe } from "../../domain/services/meal-suggestor.service";

const EXERCISES: CatalogExercise[] = [{ id: "ex-1", name: "Bench Press", muscleGroup: "Chest", equipment: "Barbell" }];
const RECIPES: CatalogRecipe[] = [
  { id: "r-1", name: "Tofu scramble", defaultMealType: "BREAKFAST", dietaryTags: ["vegan"] },
];

function baseInput(overrides: Partial<AiPlanContentInput> = {}): AiPlanContentInput {
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
    programDurationWeeks: 8,
    otherActivities: [{ dayOfWeek: "TUE", activityType: "BJJ" }],
    exerciseCatalog: EXERCISES,
    recipeCatalog: RECIPES,
    ...overrides,
  };
}

const VALID_CONTENT = {
  days: [
    {
      name: "Full Body",
      dayOrder: 0,
      exercises: [
        { exerciseId: "ex-1", exerciseName: "Bench Press", order: 0, targetSets: 3, targetRepsMin: 8, targetRepsMax: 12, restSeconds: 90 },
      ],
    },
  ],
  mealSuggestions: {
    breakfast: [{ id: "r-1", name: "Tofu scramble", dietaryTags: ["vegan"] }],
    lunch: [],
    dinner: [],
    snack: [],
    warnings: [],
  },
  notes: ["Week 1-2: focus on form."],
};

function toolCallResult(args: unknown, name = "buildPlan"): LlmCompletionResult {
  return { content: "", toolCalls: [{ id: "call-1", name, arguments: JSON.stringify(args) }] };
}

function makeLlm(completeImpl: (...args: unknown[]) => Promise<LlmCompletionResult>): LlmClientPort {
  return { complete: jest.fn(completeImpl) };
}

describe("AiPlanContentService", () => {
  it("returns the validated content on a valid first response", async () => {
    const llm = makeLlm(async () => toolCallResult(VALID_CONTENT));
    const service = new AiPlanContentService(llm);
    const result = await service.generate(baseInput());
    expect(result).toEqual(VALID_CONTENT);
    expect(llm.complete).toHaveBeenCalledTimes(1);
  });

  it("retries once and succeeds after invalid JSON on the first attempt", async () => {
    let call = 0;
    const llm = makeLlm(async () => {
      call += 1;
      if (call === 1) return { content: "", toolCalls: [{ id: "call-1", name: "buildPlan", arguments: "{not json" }] };
      return toolCallResult(VALID_CONTENT);
    });
    const service = new AiPlanContentService(llm);
    const result = await service.generate(baseInput());
    expect(result).toEqual(VALID_CONTENT);
    expect(llm.complete).toHaveBeenCalledTimes(2);
  });

  it("throws after exhausting retries when the payload never matches the schema", async () => {
    const llm = makeLlm(async () => toolCallResult({ notTheRightShape: true }));
    const service = new AiPlanContentService(llm);
    await expect(service.generate(baseInput())).rejects.toThrow(/failed to produce a valid plan/);
    expect(llm.complete).toHaveBeenCalledTimes(2);
  });

  it("throws when the model references an exerciseId outside the provided catalog", async () => {
    const hallucinated = {
      ...VALID_CONTENT,
      days: [{ ...VALID_CONTENT.days[0]!, exercises: [{ ...VALID_CONTENT.days[0]!.exercises[0]!, exerciseId: "made-up-id" }] }],
    };
    const llm = makeLlm(async () => toolCallResult(hallucinated));
    const service = new AiPlanContentService(llm);
    await expect(service.generate(baseInput())).rejects.toThrow(/failed to produce a valid plan/);
    expect(llm.complete).toHaveBeenCalledTimes(2);
  });

  it("throws when the model never calls the tool", async () => {
    const llm = makeLlm(async () => ({ content: "Sure, here's a plan...", toolCalls: [] }));
    const service = new AiPlanContentService(llm);
    await expect(service.generate(baseInput())).rejects.toThrow(/failed to produce a valid plan/);
    expect(llm.complete).toHaveBeenCalledTimes(2);
  });
});
