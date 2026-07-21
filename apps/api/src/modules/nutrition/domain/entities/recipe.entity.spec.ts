import { RecipeEntity } from "./recipe.entity";

describe("RecipeEntity", () => {
  const recipe = new RecipeEntity(
    "recipe-1",
    "user-1",
    "Chicken & rice",
    2,
    null,
    "LUNCH",
    [
      {
        id: "line-1",
        ingredientId: "ing-chicken",
        ingredientName: "Chicken breast",
        quantityGrams: 300,
        macrosPer100g: { calories: 165, proteinGrams: 31, carbsGrams: 0, fatGrams: 3.6 },
      },
      {
        id: "line-2",
        ingredientId: "ing-rice",
        ingredientName: "White rice",
        quantityGrams: 150,
        macrosPer100g: { calories: 130, proteinGrams: 2.7, carbsGrams: 28, fatGrams: 0.3 },
      },
    ],
    new Date("2026-01-01"),
  );

  it("computes total macros from its ingredient composition, never from a hand-entered value", () => {
    expect(recipe.getTotalMacros()).toEqual({
      calories: 690,
      proteinGrams: 97.1,
      carbsGrams: 42,
      fatGrams: 11.3,
    });
  });

  it("divides total macros by the serving count for per-serving macros", () => {
    expect(recipe.getMacrosPerServing()).toEqual({
      calories: 345,
      proteinGrams: 48.6,
      carbsGrams: 21,
      fatGrams: 5.7,
    });
  });
});
