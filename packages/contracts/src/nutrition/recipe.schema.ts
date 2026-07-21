import { z } from "zod";
import { mealTypeSchema } from "../common/meal-type.schema";

export const recipeIngredientInputSchema = z.object({
  ingredientId: z.string(),
  quantityGrams: z.number().positive(),
});

export const createRecipeSchema = z.object({
  name: z.string().min(1).max(120),
  servings: z.number().int().positive().default(1),
  instructions: z.string().max(4000).optional(),
  defaultMealType: mealTypeSchema.optional(),
  ingredients: z.array(recipeIngredientInputSchema).min(1),
});
export type CreateRecipeInput = z.infer<typeof createRecipeSchema>;

export const updateRecipeSchema = createRecipeSchema.partial();
export type UpdateRecipeInput = z.infer<typeof updateRecipeSchema>;

export const macrosSchema = z.object({
  calories: z.number(),
  proteinGrams: z.number(),
  carbsGrams: z.number(),
  fatGrams: z.number(),
});
export type Macros = z.infer<typeof macrosSchema>;

export const recipeSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string(),
  servings: z.number().int(),
  instructions: z.string().nullable(),
  defaultMealType: mealTypeSchema.nullable(),
  ingredients: z.array(
    recipeIngredientInputSchema.extend({ id: z.string(), ingredientName: z.string() }),
  ),
  macrosPerServing: macrosSchema,
  macrosTotal: macrosSchema,
  createdAt: z.string().datetime(),
});
export type Recipe = z.infer<typeof recipeSchema>;
