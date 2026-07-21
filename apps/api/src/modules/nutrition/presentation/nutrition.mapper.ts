import type { Ingredient, Meal, Recipe } from "@ihsan/contracts";
import { IngredientEntity } from "../domain/entities/ingredient.entity";
import { RecipeEntity } from "../domain/entities/recipe.entity";
import { MealEntity } from "../domain/entities/meal.entity";

export function toIngredientDto(entity: IngredientEntity): Ingredient {
  return {
    id: entity.id,
    userId: entity.userId,
    name: entity.name,
    caloriesPer100g: entity.macrosPer100g.calories,
    proteinPer100g: entity.macrosPer100g.proteinGrams,
    carbsPer100g: entity.macrosPer100g.carbsGrams,
    fatPer100g: entity.macrosPer100g.fatGrams,
    createdAt: entity.createdAt.toISOString(),
  };
}

export function toRecipeDto(entity: RecipeEntity): Recipe {
  return {
    id: entity.id,
    userId: entity.userId,
    name: entity.name,
    servings: entity.servings,
    instructions: entity.instructions,
    defaultMealType: entity.defaultMealType,
    ingredients: entity.lines.map((line) => ({
      id: line.id,
      ingredientId: line.ingredientId,
      ingredientName: line.ingredientName,
      quantityGrams: line.quantityGrams,
    })),
    macrosPerServing: entity.getMacrosPerServing(),
    macrosTotal: entity.getTotalMacros(),
    createdAt: entity.createdAt.toISOString(),
  };
}

export function toMealDto(entity: MealEntity): Meal {
  return {
    id: entity.id,
    userId: entity.userId,
    date: entity.date,
    mealType: entity.mealType,
    name: entity.name,
    items: entity.items.map((item) => ({
      id: item.id,
      recipeId: item.source.kind === "recipe" ? item.source.recipeId : null,
      ingredientId: item.source.kind === "ingredient" ? item.source.ingredientId : null,
      label: item.label,
      quantity: item.quantity,
      macros: entity.getItemMacros(item.id)!,
    })),
    macrosTotal: entity.getTotalMacros(),
    createdAt: entity.createdAt.toISOString(),
  };
}
