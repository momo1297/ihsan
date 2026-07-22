import { z } from "zod";
import { macrosSchema } from "../nutrition/recipe.schema";

export const experienceLevelSchema = z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]);
export type ExperienceLevel = z.infer<typeof experienceLevelSchema>;

export const trainingGoalSchema = z.enum(["STRENGTH", "HYPERTROPHY", "FAT_LOSS", "GENERAL_FITNESS"]);
export type TrainingGoal = z.infer<typeof trainingGoalSchema>;

export const equipmentAccessSchema = z.enum(["FULL_GYM", "BASIC_HOME", "BODYWEIGHT_ONLY"]);
export type EquipmentAccess = z.infer<typeof equipmentAccessSchema>;

export const jobTypeSchema = z.enum(["SEDENTARY", "MODERATE", "PHYSICAL"]);
export type JobType = z.infer<typeof jobTypeSchema>;

export const dietaryRestrictionSchema = z.enum(["VEGETARIAN", "VEGAN", "GLUTEN_FREE", "DAIRY_FREE", "NUT_FREE"]);
export type DietaryRestriction = z.infer<typeof dietaryRestrictionSchema>;

export const weightGoalDirectionSchema = z.enum(["LOSE", "GAIN", "MAINTAIN"]);
export type WeightGoalDirection = z.infer<typeof weightGoalDirectionSchema>;

export const planIntakeSchema = z.object({
  daysPerWeek: z.number().int().min(1).max(7),
  experienceLevel: experienceLevelSchema,
  trainingGoal: trainingGoalSchema,
  physicalRestrictions: z.string().max(500),
  equipmentAccess: equipmentAccessSchema,
  jobType: jobTypeSchema,
  dietaryRestrictions: z.array(dietaryRestrictionSchema),
  otherDietaryNotes: z.string().max(500),
  mealsPerDay: z.number().int().min(2).max(6),
  weightGoalDirection: weightGoalDirectionSchema,
  targetWeightKg: z.number().positive().nullable(),
  age: z.number().int().min(13).max(100),
  currentWeightKg: z.number().positive(),
  heightCm: z.number().positive(),
  sex: z.enum(["MALE", "FEMALE"]),
});
export type PlanIntake = z.infer<typeof planIntakeSchema>;

export const generatedExerciseLineSchema = z.object({
  exerciseId: z.string(),
  exerciseName: z.string(),
  order: z.number().int(),
  targetSets: z.number().int(),
  targetRepsMin: z.number().int(),
  targetRepsMax: z.number().int(),
  restSeconds: z.number().int(),
});

export const generatedDaySchema = z.object({
  name: z.string(),
  dayOrder: z.number().int(),
  exercises: z.array(generatedExerciseLineSchema),
});

export const recipeSuggestionSchema = z.object({
  id: z.string(),
  name: z.string(),
  dietaryTags: z.array(z.string()),
});

export const mealSuggestionResultSchema = z.object({
  breakfast: z.array(recipeSuggestionSchema),
  lunch: z.array(recipeSuggestionSchema),
  dinner: z.array(recipeSuggestionSchema),
  snack: z.array(recipeSuggestionSchema),
  warnings: z.array(z.string()),
});

export const proposedWeightGoalSchema = z.object({
  direction: weightGoalDirectionSchema,
  startValue: z.number(),
  targetValue: z.number().nullable(),
});

export const proposedPlanSchema = z.object({
  program: z.object({ name: z.string(), days: z.array(generatedDaySchema) }),
  nutritionTarget: macrosSchema,
  mealSuggestions: mealSuggestionResultSchema,
  weightGoal: proposedWeightGoalSchema.nullable(),
  notes: z.array(z.string()),
});
export type ProposedPlan = z.infer<typeof proposedPlanSchema>;

export const wizardChatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string(),
});
export type WizardChatMessage = z.infer<typeof wizardChatMessageSchema>;

export const wizardChatRequestSchema = z.object({
  history: z.array(wizardChatMessageSchema),
  content: z.string().min(1).max(2000),
});
export type WizardChatRequest = z.infer<typeof wizardChatRequestSchema>;

export const wizardChatResponseSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("question"), message: z.string(), history: z.array(wizardChatMessageSchema) }),
  z.object({ type: z.literal("proposal"), plan: proposedPlanSchema, history: z.array(wizardChatMessageSchema) }),
]);
export type WizardChatResponse = z.infer<typeof wizardChatResponseSchema>;

export const selectedMealRecipesSchema = z.object({
  breakfast: z.string().optional(),
  lunch: z.string().optional(),
  dinner: z.string().optional(),
  snack: z.string().optional(),
});
export type SelectedMealRecipes = z.infer<typeof selectedMealRecipesSchema>;

export const applyPlanRequestSchema = z.object({
  program: z.object({ name: z.string(), days: z.array(generatedDaySchema) }),
  nutritionTarget: macrosSchema,
  selectedMealRecipes: selectedMealRecipesSchema,
  weightGoal: proposedWeightGoalSchema.nullable(),
});
export type ApplyPlanRequest = z.infer<typeof applyPlanRequestSchema>;

export const applyPlanResultSchema = z.object({
  programId: z.string(),
  mealTemplateId: z.string().nullable(),
  goalId: z.string().nullable(),
});
export type ApplyPlanResult = z.infer<typeof applyPlanResultSchema>;
