import { z } from "zod";
import { calendarDateSchema } from "../common/date.schema";
import { mealTypeSchema } from "../common/meal-type.schema";
import { macrosSchema } from "./recipe.schema";

const mealItemInputSchema = z
  .object({
    recipeId: z.string().optional(),
    ingredientId: z.string().optional(),
    quantity: z.number().positive(),
  })
  .refine((item) => Boolean(item.recipeId) !== Boolean(item.ingredientId), {
    message: "Exactly one of recipeId or ingredientId must be set",
  });

export const createMealSchema = z.object({
  date: calendarDateSchema,
  mealType: mealTypeSchema,
  name: z.string().max(120).optional(),
  items: z.array(mealItemInputSchema).min(1),
});
export type CreateMealInput = z.infer<typeof createMealSchema>;

export const updateMealSchema = createMealSchema.partial();
export type UpdateMealInput = z.infer<typeof updateMealSchema>;

export const mealSchema = z.object({
  id: z.string(),
  userId: z.string(),
  date: calendarDateSchema,
  mealType: mealTypeSchema,
  name: z.string().nullable(),
  items: z.array(
    z.object({
      id: z.string(),
      recipeId: z.string().nullable(),
      ingredientId: z.string().nullable(),
      label: z.string(),
      quantity: z.number(),
      macros: macrosSchema,
    }),
  ),
  macrosTotal: macrosSchema,
  createdAt: z.string().datetime(),
});
export type Meal = z.infer<typeof mealSchema>;
