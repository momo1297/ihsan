import { Inject, Injectable } from "@nestjs/common";
import type { Prisma, PrismaClient } from "@ihsan/database";
import { CreateRecipeInput, UpdateRecipeInput } from "@ihsan/contracts";
import { PRISMA_CLIENT } from "../../../../shared/database/prisma.module";
import { RecipeEntity } from "../../domain/entities/recipe.entity";
import { MealType } from "../../domain/entities/meal.entity";
import { RecipeRepositoryPort } from "../../application/ports/recipe.repository.port";

const recipeWithIngredients = {
  include: { ingredients: { include: { ingredient: true } } },
} satisfies Prisma.RecipeDefaultArgs;

type RecipeRow = Prisma.RecipeGetPayload<typeof recipeWithIngredients>;

function toEntity(row: RecipeRow): RecipeEntity {
  return new RecipeEntity(
    row.id,
    row.userId,
    row.name,
    row.servings,
    row.instructions,
    row.defaultMealType as MealType | null,
    row.ingredients.map((line) => ({
      id: line.id,
      ingredientId: line.ingredientId,
      ingredientName: line.ingredient.name,
      quantityGrams: line.quantityGrams,
      macrosPer100g: {
        calories: line.ingredient.caloriesPer100g,
        proteinGrams: line.ingredient.proteinPer100g,
        carbsGrams: line.ingredient.carbsPer100g,
        fatGrams: line.ingredient.fatPer100g,
      },
    })),
    row.createdAt,
  );
}

@Injectable()
export class PrismaRecipeRepository implements RecipeRepositoryPort {
  constructor(@Inject(PRISMA_CLIENT) private readonly prisma: PrismaClient) {}

  async create(userId: string, input: CreateRecipeInput): Promise<RecipeEntity> {
    const row = await this.prisma.recipe.create({
      data: {
        userId,
        name: input.name,
        servings: input.servings,
        instructions: input.instructions,
        defaultMealType: input.defaultMealType,
        ingredients: {
          create: input.ingredients.map((i) => ({
            ingredientId: i.ingredientId,
            quantityGrams: i.quantityGrams,
          })),
        },
      },
      ...recipeWithIngredients,
    });
    return toEntity(row);
  }

  async update(id: string, userId: string, input: UpdateRecipeInput): Promise<RecipeEntity> {
    const row = await this.prisma.$transaction(async (tx) => {
      if (input.ingredients) {
        await tx.recipeIngredient.deleteMany({ where: { recipeId: id } });
      }
      return tx.recipe.update({
        where: { id },
        data: {
          name: input.name,
          servings: input.servings,
          instructions: input.instructions,
          defaultMealType: input.defaultMealType,
          ingredients: input.ingredients
            ? {
                create: input.ingredients.map((i) => ({
                  ingredientId: i.ingredientId,
                  quantityGrams: i.quantityGrams,
                })),
              }
            : undefined,
        },
        ...recipeWithIngredients,
      });
    });
    return toEntity(row);
  }

  async delete(id: string, _userId: string): Promise<void> {
    await this.prisma.recipe.delete({ where: { id } });
  }

  async findById(id: string, userId: string): Promise<RecipeEntity | null> {
    const row = await this.prisma.recipe.findFirst({
      where: { id, userId },
      ...recipeWithIngredients,
    });
    return row ? toEntity(row) : null;
  }

  async findManyByUser(userId: string): Promise<RecipeEntity[]> {
    const rows = await this.prisma.recipe.findMany({
      where: { userId },
      orderBy: { name: "asc" },
      ...recipeWithIngredients,
    });
    return rows.map(toEntity);
  }
}
