import { Macros } from "../value-objects/macros.vo";
import { macrosForRecipe, macrosPerServing } from "../services/macro-calculator.service";
import { MealType } from "./meal.entity";

export interface RecipeIngredientLine {
  id: string;
  ingredientId: string;
  ingredientName: string;
  quantityGrams: number;
  macrosPer100g: Macros;
}

export class RecipeEntity {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly name: string,
    public readonly servings: number,
    public readonly instructions: string | null,
    public readonly defaultMealType: MealType | null,
    public readonly lines: RecipeIngredientLine[],
    public readonly createdAt: Date,
  ) {}

  getTotalMacros(): Macros {
    return macrosForRecipe(this.lines);
  }

  getMacrosPerServing(): Macros {
    return macrosPerServing(this.getTotalMacros(), this.servings);
  }
}
