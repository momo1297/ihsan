import { z } from "zod";
import { calendarDateSchema } from "../common/date.schema";
import { mealTypeSchema } from "../common/meal-type.schema";

const mealTemplateItemInputSchema = z
  .object({
    recipeId: z.string().optional(),
    ingredientId: z.string().optional(),
    quantity: z.number().positive(),
    mealType: mealTypeSchema,
  })
  .refine((item) => Boolean(item.recipeId) !== Boolean(item.ingredientId), {
    message: "Exactly one of recipeId or ingredientId must be set",
  });

export const createMealTemplateSchema = z.object({
  name: z.string().min(1).max(120),
  items: z.array(mealTemplateItemInputSchema).min(1),
});
export type CreateMealTemplateInput = z.infer<typeof createMealTemplateSchema>;

export const applyMealTemplateSchema = z.object({
  date: calendarDateSchema,
});
export type ApplyMealTemplateInput = z.infer<typeof applyMealTemplateSchema>;

export const saveMealAsTemplateSchema = z.object({
  name: z.string().min(1).max(120),
});
export type SaveMealAsTemplateInput = z.infer<typeof saveMealAsTemplateSchema>;
