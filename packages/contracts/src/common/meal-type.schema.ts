import { z } from "zod";

// Lives here (rather than in nutrition/meal.schema.ts) so nutrition/recipe.schema.ts
// can also depend on it without creating a circular import between the two files.
export const mealTypeSchema = z.enum(["BREAKFAST", "LUNCH", "DINNER", "SNACK"]);
export type MealType = z.infer<typeof mealTypeSchema>;
