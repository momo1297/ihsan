import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type MealType = "BREAKFAST" | "LUNCH" | "DINNER" | "SNACK";

interface SeedIngredient {
  name: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
}

interface SeedRecipeLine {
  ingredient: string;
  quantityGrams: number;
}

interface SeedRecipe {
  name: string;
  servings: number;
  defaultMealType: MealType;
  instructions?: string;
  lines: SeedRecipeLine[];
}

// Approximate values per 100g — good enough for personal tracking, editable after seeding.
const INGREDIENTS: SeedIngredient[] = [
  { name: "Chicken breast (cooked)", caloriesPer100g: 165, proteinPer100g: 31, carbsPer100g: 0, fatPer100g: 3.6 },
  { name: "Basmati rice (cooked)", caloriesPer100g: 121, proteinPer100g: 2.7, carbsPer100g: 25, fatPer100g: 0.4 },
  { name: "Salmon (cooked)", caloriesPer100g: 208, proteinPer100g: 20, carbsPer100g: 0, fatPer100g: 13 },
  { name: "Quinoa (cooked)", caloriesPer100g: 120, proteinPer100g: 4.4, carbsPer100g: 21, fatPer100g: 1.9 },
  { name: "Avocado", caloriesPer100g: 160, proteinPer100g: 2, carbsPer100g: 8.5, fatPer100g: 14.7 },
  { name: "Eggs (whole)", caloriesPer100g: 155, proteinPer100g: 13, carbsPer100g: 1.1, fatPer100g: 11 },
  { name: "Spinach (raw)", caloriesPer100g: 23, proteinPer100g: 2.9, carbsPer100g: 3.6, fatPer100g: 0.4 },
  { name: "Rolled oats (dry)", caloriesPer100g: 389, proteinPer100g: 16.9, carbsPer100g: 66.3, fatPer100g: 6.9 },
  { name: "Banana", caloriesPer100g: 89, proteinPer100g: 1.1, carbsPer100g: 22.8, fatPer100g: 0.3 },
  { name: "Milk (semi-skimmed)", caloriesPer100g: 46, proteinPer100g: 3.4, carbsPer100g: 4.8, fatPer100g: 1.6 },
  { name: "Canned tuna (in water, drained)", caloriesPer100g: 116, proteinPer100g: 26, carbsPer100g: 0, fatPer100g: 1 },
  { name: "Chickpeas (cooked)", caloriesPer100g: 164, proteinPer100g: 8.9, carbsPer100g: 27.4, fatPer100g: 2.6 },
  { name: "Ground beef 5% fat (cooked)", caloriesPer100g: 172, proteinPer100g: 26, carbsPer100g: 0, fatPer100g: 7.5 },
  { name: "Pasta (cooked)", caloriesPer100g: 131, proteinPer100g: 5, carbsPer100g: 25, fatPer100g: 1.1 },
  { name: "Tomato sauce", caloriesPer100g: 29, proteinPer100g: 1.4, carbsPer100g: 5.4, fatPer100g: 0.4 },
  { name: "Onion", caloriesPer100g: 40, proteinPer100g: 1.1, carbsPer100g: 9.3, fatPer100g: 0.1 },
  { name: "Olive oil", caloriesPer100g: 884, proteinPer100g: 0, carbsPer100g: 0, fatPer100g: 100 },
  { name: "Greek yogurt (plain, 0%)", caloriesPer100g: 59, proteinPer100g: 10, carbsPer100g: 3.6, fatPer100g: 0.4 },
  { name: "Almonds", caloriesPer100g: 579, proteinPer100g: 21, carbsPer100g: 22, fatPer100g: 50 },
  { name: "Sweet potato (cooked)", caloriesPer100g: 90, proteinPer100g: 2, carbsPer100g: 21, fatPer100g: 0.1 },
  { name: "Turkey breast (cooked)", caloriesPer100g: 135, proteinPer100g: 30, carbsPer100g: 0, fatPer100g: 1 },
  { name: "Brown rice (cooked)", caloriesPer100g: 123, proteinPer100g: 2.7, carbsPer100g: 26, fatPer100g: 1 },
  { name: "Broccoli (cooked)", caloriesPer100g: 35, proteinPer100g: 2.4, carbsPer100g: 7, fatPer100g: 0.4 },
  { name: "Bell pepper (raw)", caloriesPer100g: 31, proteinPer100g: 1, carbsPer100g: 6, fatPer100g: 0.3 },
  { name: "Honey", caloriesPer100g: 304, proteinPer100g: 0.3, carbsPer100g: 82, fatPer100g: 0 },
  { name: "Peanut butter", caloriesPer100g: 588, proteinPer100g: 25, carbsPer100g: 20, fatPer100g: 50 },
  { name: "Whole wheat bread", caloriesPer100g: 247, proteinPer100g: 13, carbsPer100g: 41, fatPer100g: 3.4 },
  { name: "Cottage cheese (low fat)", caloriesPer100g: 72, proteinPer100g: 12, carbsPer100g: 3, fatPer100g: 1 },
  { name: "Blueberries", caloriesPer100g: 57, proteinPer100g: 0.7, carbsPer100g: 14, fatPer100g: 0.3 },
  { name: "Cucumber", caloriesPer100g: 15, proteinPer100g: 0.7, carbsPer100g: 3.6, fatPer100g: 0.1 },
];

const RECIPES: SeedRecipe[] = [
  // Breakfast
  {
    name: "Spinach omelette",
    servings: 1,
    defaultMealType: "BREAKFAST",
    instructions: "Whisk eggs, cook with spinach in olive oil until set.",
    lines: [
      { ingredient: "Eggs (whole)", quantityGrams: 150 },
      { ingredient: "Spinach (raw)", quantityGrams: 30 },
      { ingredient: "Olive oil", quantityGrams: 5 },
    ],
  },
  {
    name: "Banana overnight oats",
    servings: 1,
    defaultMealType: "BREAKFAST",
    instructions: "Mix oats and milk, refrigerate overnight, top with sliced banana.",
    lines: [
      { ingredient: "Rolled oats (dry)", quantityGrams: 60 },
      { ingredient: "Milk (semi-skimmed)", quantityGrams: 200 },
      { ingredient: "Banana", quantityGrams: 100 },
    ],
  },
  {
    name: "Greek yogurt with almonds",
    servings: 1,
    defaultMealType: "BREAKFAST",
    instructions: "Top Greek yogurt with sliced banana and almonds.",
    lines: [
      { ingredient: "Greek yogurt (plain, 0%)", quantityGrams: 200 },
      { ingredient: "Almonds", quantityGrams: 20 },
      { ingredient: "Banana", quantityGrams: 50 },
    ],
  },
  {
    name: "Peanut butter banana toast",
    servings: 1,
    defaultMealType: "BREAKFAST",
    instructions: "Toast the bread, spread peanut butter, top with sliced banana.",
    lines: [
      { ingredient: "Whole wheat bread", quantityGrams: 60 },
      { ingredient: "Peanut butter", quantityGrams: 30 },
      { ingredient: "Banana", quantityGrams: 100 },
    ],
  },
  {
    name: "Protein eggs & toast",
    servings: 1,
    defaultMealType: "BREAKFAST",
    instructions: "Scramble the eggs in olive oil, serve with toasted bread.",
    lines: [
      { ingredient: "Eggs (whole)", quantityGrams: 150 },
      { ingredient: "Whole wheat bread", quantityGrams: 60 },
      { ingredient: "Olive oil", quantityGrams: 5 },
    ],
  },
  {
    name: "Cottage cheese berry bowl",
    servings: 1,
    defaultMealType: "BREAKFAST",
    instructions: "Top cottage cheese with blueberries and a drizzle of honey.",
    lines: [
      { ingredient: "Cottage cheese (low fat)", quantityGrams: 200 },
      { ingredient: "Blueberries", quantityGrams: 80 },
      { ingredient: "Honey", quantityGrams: 10 },
    ],
  },
  // Lunch
  {
    name: "Grilled chicken & rice",
    servings: 1,
    defaultMealType: "LUNCH",
    instructions: "Grill the chicken breast, serve over cooked basmati rice.",
    lines: [
      { ingredient: "Chicken breast (cooked)", quantityGrams: 200 },
      { ingredient: "Basmati rice (cooked)", quantityGrams: 150 },
    ],
  },
  {
    name: "Tuna chickpea salad",
    servings: 1,
    defaultMealType: "LUNCH",
    instructions: "Toss tuna, chickpeas, diced onion, and olive oil together.",
    lines: [
      { ingredient: "Canned tuna (in water, drained)", quantityGrams: 120 },
      { ingredient: "Chickpeas (cooked)", quantityGrams: 150 },
      { ingredient: "Onion", quantityGrams: 20 },
      { ingredient: "Olive oil", quantityGrams: 10 },
    ],
  },
  {
    name: "Turkey brown rice bowl",
    servings: 1,
    defaultMealType: "LUNCH",
    instructions: "Serve turkey breast over brown rice with steamed broccoli.",
    lines: [
      { ingredient: "Turkey breast (cooked)", quantityGrams: 200 },
      { ingredient: "Brown rice (cooked)", quantityGrams: 150 },
      { ingredient: "Broccoli (cooked)", quantityGrams: 100 },
    ],
  },
  {
    name: "Chicken broccoli stir fry",
    servings: 1,
    defaultMealType: "LUNCH",
    instructions: "Stir fry chicken and broccoli in olive oil, serve over brown rice.",
    lines: [
      { ingredient: "Chicken breast (cooked)", quantityGrams: 200 },
      { ingredient: "Broccoli (cooked)", quantityGrams: 150 },
      { ingredient: "Brown rice (cooked)", quantityGrams: 100 },
      { ingredient: "Olive oil", quantityGrams: 5 },
    ],
  },
  {
    name: "Beef pasta",
    servings: 2,
    defaultMealType: "LUNCH",
    instructions: "Brown the ground beef with onion, add tomato sauce, mix with cooked pasta.",
    lines: [
      { ingredient: "Ground beef 5% fat (cooked)", quantityGrams: 150 },
      { ingredient: "Pasta (cooked)", quantityGrams: 200 },
      { ingredient: "Tomato sauce", quantityGrams: 100 },
      { ingredient: "Onion", quantityGrams: 30 },
    ],
  },
  {
    name: "Sweet potato & chicken",
    servings: 1,
    defaultMealType: "LUNCH",
    instructions: "Roast the sweet potato, serve alongside grilled chicken breast, drizzle with olive oil.",
    lines: [
      { ingredient: "Sweet potato (cooked)", quantityGrams: 200 },
      { ingredient: "Chicken breast (cooked)", quantityGrams: 150 },
      { ingredient: "Olive oil", quantityGrams: 5 },
    ],
  },
  // Dinner
  {
    name: "Salmon quinoa bowl",
    servings: 1,
    defaultMealType: "DINNER",
    instructions: "Combine cooked salmon, quinoa, sliced avocado, and spinach in a bowl.",
    lines: [
      { ingredient: "Salmon (cooked)", quantityGrams: 150 },
      { ingredient: "Quinoa (cooked)", quantityGrams: 100 },
      { ingredient: "Avocado", quantityGrams: 50 },
      { ingredient: "Spinach (raw)", quantityGrams: 30 },
    ],
  },
  {
    name: "Grilled salmon & broccoli",
    servings: 1,
    defaultMealType: "DINNER",
    instructions: "Grill the salmon, serve with steamed broccoli and a drizzle of olive oil.",
    lines: [
      { ingredient: "Salmon (cooked)", quantityGrams: 180 },
      { ingredient: "Broccoli (cooked)", quantityGrams: 150 },
      { ingredient: "Olive oil", quantityGrams: 5 },
    ],
  },
  {
    name: "Turkey stuffed pepper bowl",
    servings: 1,
    defaultMealType: "DINNER",
    instructions: "Cook turkey with diced bell pepper, serve over brown rice.",
    lines: [
      { ingredient: "Turkey breast (cooked)", quantityGrams: 150 },
      { ingredient: "Bell pepper (raw)", quantityGrams: 100 },
      { ingredient: "Brown rice (cooked)", quantityGrams: 100 },
    ],
  },
  {
    name: "Chickpea spinach stew",
    servings: 1,
    defaultMealType: "DINNER",
    instructions: "Simmer chickpeas, spinach, and onion in tomato sauce with olive oil.",
    lines: [
      { ingredient: "Chickpeas (cooked)", quantityGrams: 200 },
      { ingredient: "Spinach (raw)", quantityGrams: 60 },
      { ingredient: "Onion", quantityGrams: 30 },
      { ingredient: "Olive oil", quantityGrams: 10 },
      { ingredient: "Tomato sauce", quantityGrams: 100 },
    ],
  },
  {
    name: "Turkey cucumber sandwich",
    servings: 1,
    defaultMealType: "DINNER",
    instructions: "Layer turkey breast and sliced cucumber between whole wheat bread.",
    lines: [
      { ingredient: "Whole wheat bread", quantityGrams: 60 },
      { ingredient: "Turkey breast (cooked)", quantityGrams: 100 },
      { ingredient: "Cucumber", quantityGrams: 50 },
    ],
  },
  {
    name: "Beef & veggie pasta",
    servings: 2,
    defaultMealType: "DINNER",
    instructions: "Brown the ground beef, add tomato sauce and broccoli, mix with cooked pasta.",
    lines: [
      { ingredient: "Ground beef 5% fat (cooked)", quantityGrams: 150 },
      { ingredient: "Pasta (cooked)", quantityGrams: 150 },
      { ingredient: "Tomato sauce", quantityGrams: 100 },
      { ingredient: "Broccoli (cooked)", quantityGrams: 80 },
    ],
  },
];

async function main() {
  const user = await prisma.user.findFirst();
  if (!user) {
    throw new Error(
      "No user found in the database — sign in via the app at least once before running the seed.",
    );
  }

  const ingredientIdByName = new Map<string, string>();

  for (const ingredient of INGREDIENTS) {
    const existing = await prisma.ingredient.findFirst({
      where: { userId: user.id, name: ingredient.name },
    });
    if (existing) {
      ingredientIdByName.set(ingredient.name, existing.id);
      continue;
    }
    const created = await prisma.ingredient.create({
      data: { userId: user.id, ...ingredient },
    });
    ingredientIdByName.set(ingredient.name, created.id);
  }
  console.log(`Seeded ${INGREDIENTS.length} ingredients (existing ones left untouched).`);

  let recipesCreated = 0;
  let recipesUpdated = 0;
  for (const recipe of RECIPES) {
    const existing = await prisma.recipe.findFirst({
      where: { userId: user.id, name: recipe.name },
    });
    if (existing) {
      if (existing.defaultMealType !== recipe.defaultMealType) {
        await prisma.recipe.update({
          where: { id: existing.id },
          data: { defaultMealType: recipe.defaultMealType },
        });
        recipesUpdated++;
      }
      continue;
    }

    await prisma.recipe.create({
      data: {
        userId: user.id,
        name: recipe.name,
        servings: recipe.servings,
        instructions: recipe.instructions,
        defaultMealType: recipe.defaultMealType,
        ingredients: {
          create: recipe.lines.map((line) => {
            const ingredientId = ingredientIdByName.get(line.ingredient);
            if (!ingredientId) {
              throw new Error(`Seed recipe "${recipe.name}" references unknown ingredient "${line.ingredient}"`);
            }
            return { ingredientId, quantityGrams: line.quantityGrams };
          }),
        },
      },
    });
    recipesCreated++;
  }
  console.log(
    `Created ${recipesCreated} new recipes, updated ${recipesUpdated} existing ones ` +
      `(${RECIPES.length - recipesCreated - recipesUpdated} already up to date).`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
