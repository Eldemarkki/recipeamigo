import { createRecipe, editRecipe, getAllRecipesForUser } from "./recipes";
import { createUserToDatabase } from "../utils/tests/testUtils";
import { createRandomRecipe } from "../utils/tests/recipes";
import { z } from "zod";
import { editRecipeSchema } from "../pages/api/recipes/[id]";
import { Ingredient, IngredientSection, Instruction, Recipe } from "@prisma/client";

describe("recipes", () => {
  it("should return empty array when user has no recipes", async () => {
    const userId = await createUserToDatabase();
    const recipes = await getAllRecipesForUser(userId);
    expect(recipes).toHaveLength(0);
  });

  it("should return array with 1 element when user has 1 recipe", async () => {
    const userId = await createUserToDatabase();
    const newRecipe = await createRecipe(userId, createRandomRecipe());
    const recipes = await getAllRecipesForUser(userId);
    expect(recipes).toHaveLength(1);
    expect(recipes[0]).toEqual(newRecipe);
  });

  it("should return array with 2 elements when user has 2 recipes", async () => {
    const userId = await createUserToDatabase();
    await createRecipe(userId, createRandomRecipe());
    await createRecipe(userId, createRandomRecipe());
    const recipes = await getAllRecipesForUser(userId);
    expect(recipes).toHaveLength(2);
  });

  it("shouldn't return other users' recipes", async () => {
    const userId1 = await createUserToDatabase();
    const userId2 = await createUserToDatabase();
    const newRecipe1 = await createRecipe(userId1, createRandomRecipe());
    const newRecipe2 = await createRecipe(userId2, createRandomRecipe());
    const recipes1 = await getAllRecipesForUser(userId1);
    const recipes2 = await getAllRecipesForUser(userId2);
    expect(recipes1).toHaveLength(1);
    expect(recipes2).toHaveLength(1);
    expect(recipes1[0]).toEqual(newRecipe1);
    expect(recipes2[0]).toEqual(newRecipe2);
  });
});

const compareRecipes = (actual: Recipe & {
  ingredientSections: (IngredientSection & {
    ingredients: Ingredient[];
  })[];
  instructions: Instruction[];
}, expected: z.infer<typeof editRecipeSchema>, original: Recipe & {
  ingredientSections: (IngredientSection & {
    ingredients: Ingredient[];
  })[];
  instructions: Instruction[];
  }) => {
  const { ingredientSections: expectedIngredientSections, instructions: expectedInstructions, ...expectedBasic } = expected;
  const { ingredientSections: actualIngredientSections, instructions: actualInstructions, ...actualBasic } = actual;

  expect(actualBasic).toEqual(expect.objectContaining({
    ...expectedBasic,
    id: original.id,
    userId: original.userId,
    createdAt: original.createdAt,
    updatedAt: expect.any(Date),
  }));

  const hasIngredientSections = !!expectedIngredientSections;
  expect(actualIngredientSections).toEqual((expectedIngredientSections ?? original.ingredientSections).map((section, sectionIndex) => ({
    ...section,
    id: (hasIngredientSections && "id" in section) ? section.id : expect.any(String),
    recipeId: original.id,
    order: sectionIndex,
    ingredients: section.ingredients?.map((ingredient, ingredientIndex) => ({
      ...ingredient,
      order: ingredientIndex,
      ingredientSectionId: (hasIngredientSections && "id" in section) ? section.id : expect.any(String),
      id: "id" in ingredient ? ingredient.id : expect.any(String),
      isOptional: ingredient.isOptional
        ?? original.ingredientSections
          .flatMap(section => section.ingredients)
          .find(i => "id" in ingredient && i.id === ingredient.id)?.isOptional
        ?? false,
    })),
  })));

  expect(actualInstructions).toEqual((expectedInstructions ?? original.instructions).map((instruction, instructionIndex) => ({
    ...instruction,
    id: "id" in instruction ? instruction.id : expect.any(String),
    recipeId: original.id,
    order: instructionIndex,
  })));
};

describe("editRecipes", () => {
  it("should update basic recipe properties", async () => {
    const userId = await createUserToDatabase();
    const recipe = await createRecipe(userId, createRandomRecipe());

    const editedRecipe: z.infer<typeof editRecipeSchema> = {
      description: "Updated description",
      name: "Updated recipe name",
      quantity: 100,
      isPublic: !recipe.isPublic,
      timeEstimateMinimumMinutes: 10000,
      timeEstimateMaximumMinutes: 100000,
    };

    const actual = await editRecipe(recipe.id, editedRecipe);

    compareRecipes(actual, editedRecipe, recipe);
  });

  it("should update recipe ingredients", async () => {
    const userId = await createUserToDatabase();
    const recipe = await createRecipe(userId, createRandomRecipe());

    const editedRecipe: z.infer<typeof editRecipeSchema> = {
      ingredientSections: [
        {
          id: recipe.ingredientSections[0].id,
          name: "Updated ingredient section name",
          ingredients: [
            {
              id: recipe.ingredientSections[0].ingredients[0].id,
              quantity: 1,
              name: "Updated ingredient name",
              unit: "TABLESPOON" as const,
            },
            {
              quantity: 2,
              name: "New ingredient name",
              unit: "DASH" as const,
            }
          ],
        },
        {
          name: "New ingredient section name",
          ingredients: [
            {
              quantity: 3,
              name: "New ingredient name 1",
              unit: "PINCH" as const,
            },
            {
              quantity: 3,
              name: "New ingredient name 2",
              unit: "PINT" as const,
            }
          ],
        }
      ],
    };

    const actual = await editRecipe(recipe.id, editedRecipe);

    compareRecipes(actual, editedRecipe, recipe);
  });

  it("should update recipe instructions", async () => {
    const userId = await createUserToDatabase();
    const recipe = await createRecipe(userId, createRandomRecipe());

    const editedRecipe: z.infer<typeof editRecipeSchema> = {
      instructions: [
        {
          id: recipe.instructions[0].id,
          description: "Updated instruction 1",
        },
        {
          id: recipe.instructions[1].id,
          description: "Updated instruction 2",
        },
        {
          description: "New instruction 1",
        },
        {
          id: recipe.instructions[2].id,
          description: "Updated instruction 4",
        },
      ]
    };

    const actual = await editRecipe(recipe.id, editedRecipe);

    compareRecipes(actual, editedRecipe, recipe);
  });
});
