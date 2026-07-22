export type DietaryRestriction = "VEGETARIAN" | "VEGAN" | "GLUTEN_FREE" | "DAIRY_FREE" | "NUT_FREE";
export type MealSlot = "BREAKFAST" | "LUNCH" | "DINNER" | "SNACK";

export interface CatalogRecipe {
  id: string;
  name: string;
  defaultMealType: MealSlot | null;
  dietaryTags: string[];
}

export interface MealSuggestionResult {
  breakfast: CatalogRecipe[];
  lunch: CatalogRecipe[];
  dinner: CatalogRecipe[];
  snack: CatalogRecipe[];
  warnings: string[];
}

const RESTRICTION_TO_TAG: Record<DietaryRestriction, string> = {
  VEGETARIAN: "vegetarian",
  VEGAN: "vegan",
  GLUTEN_FREE: "glutenFree",
  DAIRY_FREE: "dairyFree",
  NUT_FREE: "nutFree",
};

const MAX_SUGGESTIONS_PER_SLOT = 4;

export function suggestMeals(
  recipes: CatalogRecipe[],
  restrictions: DietaryRestriction[],
  mealsPerDay: number,
): MealSuggestionResult {
  const requiredTags = restrictions.map((restriction) => RESTRICTION_TO_TAG[restriction]);
  const warnings: string[] = [];

  function forSlot(slot: MealSlot): CatalogRecipe[] {
    const compatible = recipes.filter(
      (recipe) => recipe.defaultMealType === slot && requiredTags.every((tag) => recipe.dietaryTags.includes(tag)),
    );
    if (compatible.length === 0 && requiredTags.length > 0) {
      warnings.push(
        `No ${slot.toLowerCase()} recipes match your dietary restrictions yet — add your own on the Nutrition page.`,
      );
    }
    return compatible.slice(0, MAX_SUGGESTIONS_PER_SLOT);
  }

  return {
    breakfast: forSlot("BREAKFAST"),
    lunch: forSlot("LUNCH"),
    dinner: forSlot("DINNER"),
    snack: mealsPerDay > 3 ? forSlot("SNACK") : [],
    warnings,
  };
}
