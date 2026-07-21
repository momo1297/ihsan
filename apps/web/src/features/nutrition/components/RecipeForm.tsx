"use client";

import { Controller, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createRecipeSchema, type CreateRecipeInput, type FoodSearchResult } from "@ihsan/contracts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateIngredient, useIngredients } from "../api/ingredients.api";
import { useCreateRecipe } from "../api/recipes.api";
import { FoodSearchCombobox } from "./FoodSearchCombobox";

export function RecipeForm() {
  const { data: ingredients } = useIngredients();
  const createIngredient = useCreateIngredient();
  const createRecipe = useCreateRecipe();
  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CreateRecipeInput>({
    resolver: zodResolver(createRecipeSchema),
    defaultValues: { name: "", servings: 1, instructions: "", ingredients: [] },
  });
  const { fields, append, remove } = useFieldArray({ control, name: "ingredients" });

  async function addIngredientFromSearch(index: number, result: FoodSearchResult) {
    const created = await createIngredient.mutateAsync({
      name: result.name,
      caloriesPer100g: result.caloriesPer100g,
      proteinPer100g: result.proteinPer100g,
      carbsPer100g: result.carbsPer100g,
      fatPer100g: result.fatPer100g,
    });
    setValue(`ingredients.${index}.ingredientId`, created.id);
  }

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={handleSubmit((values) => createRecipe.mutate(values, { onSuccess: () => reset() }))}
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="recipe-name">Name</Label>
        <Input id="recipe-name" placeholder="Chicken & rice" {...register("name")} />
        {errors.name && <p className="text-caption text-danger">{errors.name.message}</p>}
      </div>

      <div className="flex gap-4">
        <div className="flex flex-col gap-1.5 sm:w-40">
          <Label htmlFor="servings">Servings</Label>
          <Input id="servings" type="number" min={1} {...register("servings", { valueAsNumber: true })} />
        </div>

        <div className="flex flex-col gap-1.5 sm:w-48">
          <Label>Usually eaten at</Label>
          <Controller
            control={control}
            name="defaultMealType"
            render={({ field }) => (
              <Select
                value={field.value ?? "NONE"}
                onValueChange={(value) => field.onChange(value === "NONE" ? undefined : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Not set" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NONE">Not set</SelectItem>
                  <SelectItem value="BREAKFAST">Breakfast</SelectItem>
                  <SelectItem value="LUNCH">Lunch</SelectItem>
                  <SelectItem value="DINNER">Dinner</SelectItem>
                  <SelectItem value="SNACK">Snack</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          <p className="text-caption text-text-tertiary">Controls which quick-log section it appears in.</p>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="instructions">Instructions (optional)</Label>
        <Textarea id="instructions" rows={3} {...register("instructions")} />
      </div>

      <div className="flex flex-col gap-4">
        <Label>Ingredients</Label>
        {fields.map((field, index) => (
          <div key={field.id} className="flex flex-col gap-2 rounded-md border border-border p-3">
            <FoodSearchCombobox
              placeholder="Search to add a new ingredient to this recipe"
              onSelect={(result) => addIngredientFromSearch(index, result)}
            />
            <div className="flex items-end gap-3">
              <div className="flex flex-1 flex-col gap-1.5">
                <Label className="text-caption text-text-tertiary">or choose an existing one</Label>
                <Controller
                  control={control}
                  name={`ingredients.${index}.ingredientId`}
                  render={({ field: selectField }) => (
                    <Select value={selectField.value} onValueChange={selectField.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose an ingredient" />
                      </SelectTrigger>
                      <SelectContent>
                        {ingredients?.map((ingredient) => (
                          <SelectItem key={ingredient.id} value={ingredient.id}>
                            {ingredient.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="flex w-32 flex-col gap-1.5">
                <Label className="text-caption text-text-tertiary">Grams</Label>
                <Input
                  type="number"
                  min={0}
                  placeholder="grams"
                  {...register(`ingredients.${index}.quantityGrams`, { valueAsNumber: true })}
                />
              </div>
              <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)}>
                Remove
              </Button>
            </div>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append({ ingredientId: "", quantityGrams: 100 })}
          className="self-start"
        >
          Add ingredient line
        </Button>
        {errors.ingredients && (
          <p className="text-caption text-danger">{errors.ingredients.message as string}</p>
        )}
      </div>

      <Button type="submit" disabled={createRecipe.isPending || fields.length === 0} className="self-start">
        {createRecipe.isPending ? "Saving..." : "Save recipe"}
      </Button>
    </form>
  );
}
