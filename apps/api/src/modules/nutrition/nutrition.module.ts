import { Module } from "@nestjs/common";
import { UsersModule } from "../users/users.module";
import { IngredientController } from "./presentation/ingredient.controller";
import { RecipeController } from "./presentation/recipe.controller";
import { MealController } from "./presentation/meal.controller";
import { NutritionSummaryController } from "./presentation/nutrition-summary.controller";
import { NutritionTargetController } from "./presentation/nutrition-target.controller";
import { MealTemplateController } from "./presentation/meal-template.controller";

import { CreateIngredientUseCase } from "./application/use-cases/create-ingredient.use-case";
import { UpdateIngredientUseCase } from "./application/use-cases/update-ingredient.use-case";
import { DeleteIngredientUseCase } from "./application/use-cases/delete-ingredient.use-case";
import { ListIngredientsUseCase } from "./application/use-cases/list-ingredients.use-case";
import { SearchFoodDatabaseUseCase } from "./application/use-cases/search-food-database.use-case";

import { CreateRecipeUseCase } from "./application/use-cases/create-recipe.use-case";
import { UpdateRecipeUseCase } from "./application/use-cases/update-recipe.use-case";
import { DeleteRecipeUseCase } from "./application/use-cases/delete-recipe.use-case";
import { ListRecipesUseCase } from "./application/use-cases/list-recipes.use-case";
import { GetRecipeUseCase } from "./application/use-cases/get-recipe.use-case";

import { LogMealUseCase } from "./application/use-cases/log-meal.use-case";
import { UpdateMealUseCase } from "./application/use-cases/update-meal.use-case";
import { DeleteMealUseCase } from "./application/use-cases/delete-meal.use-case";
import { ListMealsByDateUseCase } from "./application/use-cases/list-meals-by-date.use-case";
import { GetDailyMacroSummaryUseCase } from "./application/use-cases/get-daily-macro-summary.use-case";

import { SetNutritionTargetUseCase } from "./application/use-cases/set-nutrition-target.use-case";
import { ListNutritionTargetsUseCase } from "./application/use-cases/list-nutrition-targets.use-case";

import { CreateMealTemplateUseCase } from "./application/use-cases/create-meal-template.use-case";
import { ListMealTemplatesUseCase } from "./application/use-cases/list-meal-templates.use-case";
import { SaveMealAsTemplateUseCase } from "./application/use-cases/save-meal-as-template.use-case";
import { ApplyMealTemplateUseCase } from "./application/use-cases/apply-meal-template.use-case";

import { INGREDIENT_REPOSITORY } from "./application/ports/ingredient.repository.port";
import { RECIPE_REPOSITORY } from "./application/ports/recipe.repository.port";
import { MEAL_REPOSITORY } from "./application/ports/meal.repository.port";
import { NUTRITION_TARGET_REPOSITORY } from "./application/ports/nutrition-target.repository.port";
import { MEAL_TEMPLATE_REPOSITORY } from "./application/ports/meal-template.repository.port";
import { FOOD_DATABASE } from "./application/ports/food-database.port";

import { PrismaIngredientRepository } from "./infrastructure/repositories/prisma-ingredient.repository";
import { PrismaRecipeRepository } from "./infrastructure/repositories/prisma-recipe.repository";
import { PrismaMealRepository } from "./infrastructure/repositories/prisma-meal.repository";
import { PrismaNutritionTargetRepository } from "./infrastructure/repositories/prisma-nutrition-target.repository";
import { PrismaMealTemplateRepository } from "./infrastructure/repositories/prisma-meal-template.repository";
import { OpenFoodFactsAdapter } from "./infrastructure/adapters/open-food-facts.adapter";
import { ResolveCurrentUserGuard } from "../../shared/guards/resolve-current-user.guard";

@Module({
  imports: [UsersModule],
  controllers: [
    IngredientController,
    RecipeController,
    MealController,
    NutritionSummaryController,
    NutritionTargetController,
    MealTemplateController,
  ],
  providers: [
    ResolveCurrentUserGuard,
    CreateIngredientUseCase,
    UpdateIngredientUseCase,
    DeleteIngredientUseCase,
    ListIngredientsUseCase,
    CreateRecipeUseCase,
    UpdateRecipeUseCase,
    DeleteRecipeUseCase,
    ListRecipesUseCase,
    GetRecipeUseCase,
    LogMealUseCase,
    UpdateMealUseCase,
    DeleteMealUseCase,
    ListMealsByDateUseCase,
    GetDailyMacroSummaryUseCase,
    SearchFoodDatabaseUseCase,
    SetNutritionTargetUseCase,
    ListNutritionTargetsUseCase,
    CreateMealTemplateUseCase,
    ListMealTemplatesUseCase,
    SaveMealAsTemplateUseCase,
    ApplyMealTemplateUseCase,
    { provide: INGREDIENT_REPOSITORY, useClass: PrismaIngredientRepository },
    { provide: RECIPE_REPOSITORY, useClass: PrismaRecipeRepository },
    { provide: MEAL_REPOSITORY, useClass: PrismaMealRepository },
    { provide: NUTRITION_TARGET_REPOSITORY, useClass: PrismaNutritionTargetRepository },
    { provide: MEAL_TEMPLATE_REPOSITORY, useClass: PrismaMealTemplateRepository },
    { provide: FOOD_DATABASE, useClass: OpenFoodFactsAdapter },
  ],
  exports: [
    GetDailyMacroSummaryUseCase,
    ListMealsByDateUseCase,
    ListRecipesUseCase,
    SetNutritionTargetUseCase,
    CreateMealTemplateUseCase,
  ],
})
export class NutritionModule {}
