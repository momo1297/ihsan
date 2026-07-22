"use client";

import { useState } from "react";
import type { ProposedPlan, SelectedMealRecipes } from "@ihsan/contracts";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useApplyPlan } from "../api/wizard.api";

const SLOTS = ["breakfast", "lunch", "dinner", "snack"] as const;

function defaultSelection(plan: ProposedPlan): SelectedMealRecipes {
  const selection: SelectedMealRecipes = {};
  for (const slot of SLOTS) {
    const first = plan.mealSuggestions[slot][0];
    if (first) selection[slot] = first.id;
  }
  return selection;
}

export function PlanPreview({
  plan,
  onApplied,
  onAdjust,
}: {
  plan: ProposedPlan;
  onApplied: () => void;
  onAdjust: () => void;
}) {
  const [selectedMealRecipes, setSelectedMealRecipes] = useState<SelectedMealRecipes>(() => defaultSelection(plan));
  const applyPlan = useApplyPlan();

  function handleApply() {
    applyPlan.mutate(
      {
        program: plan.program,
        nutritionTarget: plan.nutritionTarget,
        selectedMealRecipes,
        weightGoal: plan.weightGoal,
      },
      { onSuccess: onApplied },
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-body font-semibold">Program: {plan.program.name}</h2>
        <div className="mt-2 flex flex-col gap-3">
          {plan.program.days.map((day) => (
            <div key={day.dayOrder} className="rounded-md border border-border bg-surface px-3 py-2">
              <p className="text-body font-medium">{day.name}</p>
              <ul className="mt-1 flex flex-col gap-0.5">
                {day.exercises.map((exercise) => (
                  <li key={exercise.exerciseId} className="text-caption text-text-secondary">
                    {exercise.exerciseName}
                    <span className="text-text-tertiary">
                      {" "}
                      · {exercise.targetSets} × {exercise.targetRepsMin}-{exercise.targetRepsMax} · rest {exercise.restSeconds}s
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-body font-semibold">Nutrition target</h2>
        <div className="mt-2 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="CALORIES" value={`${plan.nutritionTarget.calories} kcal`} />
          <Stat label="PROTEIN" value={`${plan.nutritionTarget.proteinGrams} g`} />
          <Stat label="CARBS" value={`${plan.nutritionTarget.carbsGrams} g`} />
          <Stat label="FAT" value={`${plan.nutritionTarget.fatGrams} g`} />
        </div>
      </div>

      {plan.weightGoal && (
        <div>
          <h2 className="text-body font-semibold">Weight goal</h2>
          <p className="mt-1 text-caption text-text-secondary">
            {plan.weightGoal.direction === "LOSE" ? "Lose" : "Gain"} from {plan.weightGoal.startValue}kg to{" "}
            {plan.weightGoal.targetValue}kg
          </p>
        </div>
      )}

      <div>
        <h2 className="text-body font-semibold">Suggested meals</h2>
        <div className="mt-2 flex flex-col gap-3">
          {SLOTS.map((slot) => {
            const options = plan.mealSuggestions[slot];
            if (options.length === 0) return null;
            return (
              <div key={slot} className="flex items-center gap-3">
                <span className="w-24 text-caption uppercase text-text-tertiary">{slot}</span>
                <Select
                  value={selectedMealRecipes[slot]}
                  onValueChange={(value) => setSelectedMealRecipes((s) => ({ ...s, [slot]: value }))}
                >
                  <SelectTrigger className="w-64">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {options.map((recipe) => (
                      <SelectItem key={recipe.id} value={recipe.id}>
                        {recipe.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            );
          })}
        </div>
      </div>

      {plan.notes.length > 0 && (
        <div className="rounded-md border border-border bg-surface px-3 py-2">
          {plan.notes.map((note, index) => (
            <p key={index} className="text-caption text-text-secondary">
              {note}
            </p>
          ))}
        </div>
      )}

      <div className="flex gap-3">
        <Button type="button" onClick={handleApply} disabled={applyPlan.isPending}>
          {applyPlan.isPending ? "Applying..." : "Apply this plan"}
        </Button>
        <Button type="button" variant="outline" onClick={onAdjust}>
          Keep adjusting
        </Button>
      </div>
      {applyPlan.isError && <p className="text-caption text-destructive">Couldn&apos;t apply the plan — try again.</p>}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-micro text-text-tertiary">{label}</p>
      <p className="text-body font-semibold">{value}</p>
    </div>
  );
}
