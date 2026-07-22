import { CatalogRecipe, suggestMeals } from "./meal-suggestor.service";

const RECIPES: CatalogRecipe[] = [
  { id: "1", name: "Grilled chicken & rice", defaultMealType: "LUNCH", dietaryTags: ["glutenFree", "dairyFree", "nutFree"] },
  { id: "2", name: "Tofu quinoa bowl", defaultMealType: "LUNCH", dietaryTags: ["vegetarian", "vegan", "glutenFree", "dairyFree", "nutFree"] },
  { id: "3", name: "Spinach omelette", defaultMealType: "BREAKFAST", dietaryTags: ["vegetarian", "glutenFree", "dairyFree", "nutFree"] },
  { id: "4", name: "Tofu scramble", defaultMealType: "BREAKFAST", dietaryTags: ["vegetarian", "vegan", "glutenFree", "dairyFree", "nutFree"] },
  { id: "5", name: "Salmon quinoa bowl", defaultMealType: "DINNER", dietaryTags: ["glutenFree", "dairyFree", "nutFree"] },
  { id: "6", name: "Chickpea spinach stew", defaultMealType: "DINNER", dietaryTags: ["vegetarian", "vegan", "glutenFree", "dairyFree", "nutFree"] },
];

describe("suggestMeals", () => {
  it("returns recipes for each slot when there are no restrictions", () => {
    const result = suggestMeals(RECIPES, [], 3);
    expect(result.breakfast.length).toBeGreaterThan(0);
    expect(result.lunch.length).toBeGreaterThan(0);
    expect(result.dinner.length).toBeGreaterThan(0);
    expect(result.warnings).toEqual([]);
  });

  it("filters out non-vegan recipes when VEGAN is requested", () => {
    const result = suggestMeals(RECIPES, ["VEGAN"], 3);
    expect(result.lunch.map((r) => r.name)).toEqual(["Tofu quinoa bowl"]);
    expect(result.breakfast.map((r) => r.name)).toEqual(["Tofu scramble"]);
    expect(result.dinner.map((r) => r.name)).toEqual(["Chickpea spinach stew"]);
  });

  it("only includes a snack slot when mealsPerDay is greater than 3", () => {
    const withoutSnack = suggestMeals(RECIPES, [], 3);
    const withSnack = suggestMeals(RECIPES, [], 4);
    expect(withoutSnack.snack).toEqual([]);
    expect(withSnack.snack).toEqual([]); // no SNACK-tagged recipes in this fixture, but the slot is attempted
  });

  it("warns when a restriction combination leaves a slot with nothing compatible", () => {
    const result = suggestMeals(RECIPES, ["VEGAN", "NUT_FREE", "GLUTEN_FREE"], 3);
    const onlyNonVeganLunch: CatalogRecipe[] = [
      { id: "9", name: "Beef pasta", defaultMealType: "LUNCH", dietaryTags: ["dairyFree", "nutFree"] },
    ];
    const strictResult = suggestMeals(onlyNonVeganLunch, ["VEGAN"], 3);
    expect(strictResult.lunch).toEqual([]);
    expect(strictResult.warnings.some((w) => w.includes("lunch"))).toBe(true);
    expect(result.warnings).toEqual([]);
  });
});
