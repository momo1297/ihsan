"use client";

import { useState } from "react";
import type { MealType, Recipe } from "@ihsan/contracts";
import { Button } from "@/components/ui/button";
import { useRecipes } from "../api/recipes.api";
import { useLogMeal } from "../api/meals.api";

const SLOTS: { mealType: MealType; label: string }[] = [
  { mealType: "BREAKFAST", label: "Breakfast" },
  { mealType: "LUNCH", label: "Lunch" },
  { mealType: "DINNER", label: "Dinner" },
];

function QuickLogSlot({
  mealType,
  label,
  recipes,
  date,
}: {
  mealType: MealType;
  label: string;
  recipes: Recipe[];
  date: string;
}) {
  const logMeal = useLogMeal(date);
  const [loggingId, setLoggingId] = useState<string | null>(null);

  function handleClick(recipe: Recipe) {
    setLoggingId(recipe.id);
    logMeal.mutate(
      { date, mealType, items: [{ recipeId: recipe.id, quantity: 1 }] },
      { onSettled: () => setLoggingId(null) },
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-micro text-text-tertiary">{label.toUpperCase()}</span>
      {recipes.length === 0 ? (
        <p className="text-caption text-text-tertiary">No {label.toLowerCase()} recipes yet.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {recipes.map((recipe) => (
            <Button
              key={recipe.id}
              type="button"
              variant="outline"
              size="sm"
              disabled={loggingId === recipe.id}
              onClick={() => handleClick(recipe)}
            >
              {loggingId === recipe.id ? "Logging..." : recipe.name}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}

export function QuickLogMeals({ date }: { date: string }) {
  const { data: recipes, isLoading } = useRecipes();

  if (isLoading) {
    return <p className="text-text-secondary">Loading recipes...</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      {SLOTS.map((slot) => (
        <QuickLogSlot
          key={slot.mealType}
          mealType={slot.mealType}
          label={slot.label}
          date={date}
          recipes={(recipes ?? []).filter((recipe) => recipe.defaultMealType === slot.mealType)}
        />
      ))}
    </div>
  );
}
