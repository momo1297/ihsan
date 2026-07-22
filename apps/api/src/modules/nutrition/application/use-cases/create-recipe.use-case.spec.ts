import { CreateRecipeInput, UpdateRecipeInput } from "@ihsan/contracts";
import { NotFoundError } from "../../../../shared/errors/domain-errors";
import { IngredientEntity } from "../../domain/entities/ingredient.entity";
import { RecipeEntity } from "../../domain/entities/recipe.entity";
import { IngredientRepositoryPort } from "../ports/ingredient.repository.port";
import { RecipeRepositoryPort } from "../ports/recipe.repository.port";
import { CreateRecipeUseCase } from "./create-recipe.use-case";

class FakeIngredientRepository implements IngredientRepositoryPort {
  constructor(private readonly ingredients: IngredientEntity[] = []) {}
  async create(): Promise<IngredientEntity> {
    throw new Error("not needed for this test");
  }
  async update(): Promise<IngredientEntity> {
    throw new Error("not needed for this test");
  }
  async delete(): Promise<void> {}
  async findById(id: string, userId: string): Promise<IngredientEntity | null> {
    return this.ingredients.find((i) => i.id === id && i.userId === userId) ?? null;
  }
  async findManyByUser(): Promise<IngredientEntity[]> {
    return this.ingredients;
  }
}

class FakeRecipeRepository implements RecipeRepositoryPort {
  public created: { userId: string; input: CreateRecipeInput }[] = [];
  async create(userId: string, input: CreateRecipeInput): Promise<RecipeEntity> {
    this.created.push({ userId, input });
    return new RecipeEntity(
      "recipe-1",
      userId,
      input.name,
      input.servings ?? 1,
      null,
      input.defaultMealType ?? null,
      [],
      [],
      new Date(),
    );
  }
  async update(_id: string, _userId: string, _input: UpdateRecipeInput): Promise<RecipeEntity> {
    throw new Error("not needed for this test");
  }
  async delete(): Promise<void> {}
  async findById(): Promise<RecipeEntity | null> {
    return null;
  }
  async findManyByUser(): Promise<RecipeEntity[]> {
    return [];
  }
}

const chicken = new IngredientEntity(
  "ing-chicken",
  "user-1",
  "Chicken breast",
  { calories: 165, proteinGrams: 31, carbsGrams: 0, fatGrams: 3.6 },
  new Date(),
);

describe("CreateRecipeUseCase", () => {
  it("creates the recipe when every referenced ingredient belongs to the user", async () => {
    const recipes = new FakeRecipeRepository();
    const ingredients = new FakeIngredientRepository([chicken]);
    const useCase = new CreateRecipeUseCase(recipes, ingredients);

    await useCase.execute("user-1", {
      name: "Grilled chicken",
      servings: 2,
      ingredients: [{ ingredientId: "ing-chicken", quantityGrams: 300 }],
    });

    expect(recipes.created).toHaveLength(1);
    expect(recipes.created[0]?.input.name).toBe("Grilled chicken");
  });

  it("refuses to create a recipe that references an ingredient the user doesn't own", async () => {
    const recipes = new FakeRecipeRepository();
    const ingredients = new FakeIngredientRepository([chicken]);
    const useCase = new CreateRecipeUseCase(recipes, ingredients);

    await expect(
      useCase.execute("user-1", {
        name: "Mystery meal",
        servings: 1,
        ingredients: [{ ingredientId: "ing-does-not-exist", quantityGrams: 100 }],
      }),
    ).rejects.toThrow(NotFoundError);

    expect(recipes.created).toHaveLength(0);
  });
});
