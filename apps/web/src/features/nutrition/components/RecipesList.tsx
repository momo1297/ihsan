"use client";

import { Button } from "@/components/ui/button";
import { useDeleteRecipe, useRecipes } from "../api/recipes.api";

export function RecipesList() {
  const { data: recipes, isLoading } = useRecipes();
  const deleteRecipe = useDeleteRecipe();

  if (isLoading) return <p className="text-text-secondary">Loading recipes...</p>;
  if (!recipes || recipes.length === 0) {
    return <p className="text-text-secondary">No recipes yet — build your first one above.</p>;
  }

  return (
    <ul className="flex flex-col gap-2">
      {recipes.map((recipe) => (
        <li
          key={recipe.id}
          className="flex items-center justify-between rounded-md border border-border bg-surface px-3 py-2"
        >
          <div>
            <p className="text-body font-medium">
              {recipe.name} <span className="text-text-tertiary">· {recipe.servings} servings</span>
              {recipe.defaultMealType && (
                <span className="text-text-tertiary"> · {recipe.defaultMealType.toLowerCase()}</span>
              )}
            </p>
            <p className="text-caption text-text-secondary">
              Per serving: {recipe.macrosPerServing.calories} kcal ·{" "}
              {recipe.macrosPerServing.proteinGrams}g protein · {recipe.macrosPerServing.carbsGrams}g
              carbs · {recipe.macrosPerServing.fatGrams}g fat
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={deleteRecipe.isPending}
            onClick={() => deleteRecipe.mutate(recipe.id)}
          >
            Delete
          </Button>
        </li>
      ))}
    </ul>
  );
}
