import type { editRecipeSchema } from "../handlers/recipes/recipePutHandler";
import { createRandomRecipe } from "../utils/tests/recipes";
import { createUserToDatabase } from "../utils/tests/testUtils";
import {
  createRecipe,
  editRecipe,
  getAllRecipesForUser,
  getSingleRecipeWithoutCoverImageUrl,
} from "./recipes";
import type {
  Ingredient,
  IngredientSection,
  Instruction,
  Recipe,
} from "@prisma/client";
import { RecipeVisibility } from "@prisma/client";
import type { z } from "zod";

describe("recipes", () => {
  it("should return empty array when user has no recipes", async () => {
    const userId = await createUserToDatabase();
    const recipes = await getAllRecipesForUser(userId);
    expect(recipes).toHaveLength(0);
  });

  it("should return array with 1 element when user has 1 recipe", async () => {
    const userId = await createUserToDatabase();
    const newRecipe = await createRecipe(userId, createRandomRecipe(), null);
    const recipes = await getAllRecipesForUser(userId);
    expect(recipes).toHaveLength(1);
    expect(recipes[0].id).toEqual(newRecipe.id);
  });

  it("should return array with 2 elements when user has 2 recipes", async () => {
    const userId = await createUserToDatabase();
    await createRecipe(userId, createRandomRecipe(), null);
    await createRecipe(userId, createRandomRecipe(), null);
    const recipes = await getAllRecipesForUser(userId);
    expect(recipes).toHaveLength(2);
  });

  it("shouldn't return other users' recipes", async () => {
    const userId1 = await createUserToDatabase();
    const userId2 = await createUserToDatabase();
    const newRecipe1 = await createRecipe(userId1, createRandomRecipe(), null);
    const newRecipe2 = await createRecipe(userId2, createRandomRecipe(), null);
    const recipes1 = await getAllRecipesForUser(userId1);
    const recipes2 = await getAllRecipesForUser(userId2);
    expect(recipes1).toHaveLength(1);
    expect(recipes2).toHaveLength(1);
    expect(recipes1[0].id).toEqual(newRecipe1.id);
    expect(recipes2[0].id).toEqual(newRecipe2.id);
  });
});

const compareRecipes = (
  actual: Recipe & {
    ingredientSections: (IngredientSection & {
      ingredients: Ingredient[];
    })[];
    instructions: Instruction[];
  },
  expected: z.infer<typeof editRecipeSchema>,
  original: Recipe & {
    ingredientSections: (IngredientSection & {
      ingredients: Ingredient[];
    })[];
    instructions: Instruction[];
  },
) => {
  const {
    ingredientSections: expectedIngredientSections,
    instructions: expectedInstructions,
    // Need to remove it from expectedBasic
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    coverImageAction,
    ...expectedBasic
  } = expected;
  const {
    ingredientSections: actualIngredientSections,
    instructions: actualInstructions,
    // Need to remove it from actualBasic
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    coverImageName,
    ...actualBasic
  } = actual;

  expect(actualBasic).toEqual(
    expect.objectContaining({
      ...expectedBasic,
      id: original.id,
      userId: original.userId,
      createdAt: original.createdAt,
      updatedAt: expect.any(Date) as unknown,
    }),
  );

  const hasIngredientSections = !!expectedIngredientSections;
  expect(actualIngredientSections).toEqual(
    (expectedIngredientSections ?? original.ingredientSections).map(
      (section, sectionIndex) => ({
        ...section,
        id:
          hasIngredientSections && "id" in section
            ? section.id
            : (expect.any(String) as unknown),
        recipeId: original.id,
        order: sectionIndex,
        ingredients: section.ingredients?.map(
          (ingredient, ingredientIndex) => ({
            ...ingredient,
            order: ingredientIndex,
            ingredientSectionId:
              hasIngredientSections && "id" in section
                ? section.id
                : (expect.any(String) as unknown),
            id:
              "id" in ingredient
                ? ingredient.id
                : (expect.any(String) as unknown),
            isOptional:
              ingredient.isOptional ??
              original.ingredientSections
                .flatMap((section) => section.ingredients)
                .find((i) => "id" in ingredient && i.id === ingredient.id)
                ?.isOptional ??
              false,
          }),
        ),
      }),
    ),
  );

  expect(actualInstructions).toEqual(
    (expectedInstructions ?? original.instructions).map(
      (instruction, instructionIndex) => ({
        ...instruction,
        id:
          "id" in instruction
            ? instruction.id
            : (expect.any(String) as unknown),
        recipeId: original.id,
        order: instructionIndex,
      }),
    ),
  );
};

describe("editRecipes", () => {
  it("should update basic recipe properties", async () => {
    const userId = await createUserToDatabase();
    const createdRecipeShallow = await createRecipe(
      userId,
      createRandomRecipe(),
      null,
    );
    const recipe = await getSingleRecipeWithoutCoverImageUrl(
      createdRecipeShallow.id,
    );
    if (!recipe) throw new Error("Recipe not found. This should never happen");

    const editedRecipe: z.infer<typeof editRecipeSchema> = {
      coverImageAction: "keep",
      description: "Updated description",
      name: "Updated recipe name",
      quantity: 100,
      visibility:
        recipe.visibility === RecipeVisibility.PUBLIC
          ? RecipeVisibility.PRIVATE
          : RecipeVisibility.PUBLIC,
      timeEstimateMinimumMinutes: 10000,
      timeEstimateMaximumMinutes: 100000,
    };

    await editRecipe(userId, recipe.id, editedRecipe);

    const actual = await getSingleRecipeWithoutCoverImageUrl(recipe.id);
    if (!actual) {
      throw new Error("Recipe not found");
    }

    compareRecipes(actual, editedRecipe, recipe);
  });

  it("should update recipe ingredients", async () => {
    const userId = await createUserToDatabase();
    const createdRecipeShallow = await createRecipe(
      userId,
      createRandomRecipe(),
      null,
    );
    const recipe = await getSingleRecipeWithoutCoverImageUrl(
      createdRecipeShallow.id,
    );
    if (!recipe) throw new Error("Recipe not found. This should never happen");

    const editedRecipe: z.infer<typeof editRecipeSchema> = {
      coverImageAction: "keep",
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
            },
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
            },
          ],
        },
      ],
    };

    await editRecipe(userId, recipe.id, editedRecipe);

    const actual = await getSingleRecipeWithoutCoverImageUrl(recipe.id);
    if (!actual) {
      throw new Error("Recipe not found");
    }

    compareRecipes(actual, editedRecipe, recipe);
  });

  it("should update recipe instructions", async () => {
    const userId = await createUserToDatabase();
    const createdRecipeShallow = await createRecipe(
      userId,
      createRandomRecipe(),
      null,
    );
    const recipe = await getSingleRecipeWithoutCoverImageUrl(
      createdRecipeShallow.id,
    );
    if (!recipe) throw new Error("Recipe not found. This should never happen");

    const editedRecipe: z.infer<typeof editRecipeSchema> = {
      coverImageAction: "keep",
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
      ],
    };

    await editRecipe(userId, recipe.id, editedRecipe);

    const actual = await getSingleRecipeWithoutCoverImageUrl(recipe.id);
    if (!actual) {
      throw new Error("Recipe not found");
    }

    compareRecipes(actual, editedRecipe, recipe);
  });
});
