"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AppHeader } from "@/components/AppHeader";
import { todayDateString } from "@/lib/utils";
import { MacrosSummaryCard } from "@/features/nutrition/components/MacrosSummaryCard";
import { MealsList } from "@/features/nutrition/components/MealsList";
import { QuickLogMeals } from "@/features/nutrition/components/QuickLogMeals";
import { LogMealForm } from "@/features/nutrition/components/LogMealForm";
import { RecipeForm } from "@/features/nutrition/components/RecipeForm";
import { RecipesList } from "@/features/nutrition/components/RecipesList";
import { IngredientForm } from "@/features/nutrition/components/IngredientForm";
import { IngredientsList } from "@/features/nutrition/components/IngredientsList";
import { useNutritionSummary } from "@/features/nutrition/api/summary.api";

export default function NutritionPage() {
  const date = todayDateString();
  const { data: summary, isLoading: isSummaryLoading } = useNutritionSummary(date);
  const [showCustomLog, setShowCustomLog] = useState(false);

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-6 py-8">
        <h1 className="text-title font-semibold">Nutrition</h1>

        <MacrosSummaryCard summary={summary} isLoading={isSummaryLoading} />

        <Card>
          <CardHeader>
            <CardTitle>Today&apos;s meals</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <QuickLogMeals date={date} />

            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="self-start"
              onClick={() => setShowCustomLog((v) => !v)}
            >
              {showCustomLog ? "Hide custom log" : "Log something else"}
            </Button>
            {showCustomLog && <LogMealForm date={date} />}

            <MealsList date={date} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recipes</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <RecipeForm />
            <RecipesList />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ingredients</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <IngredientForm />
            <IngredientsList />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
