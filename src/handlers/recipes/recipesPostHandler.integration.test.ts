import { getSingleRecipeWithoutCoverImageUrl } from "../../database/recipes";
import { createUserToDatabaseAndAuthenticate } from "../../utils/tests/testUtils";
import { recipesPostHandler } from "./recipesPostHandler";
import { RecipeVisibility } from "@prisma/client";
import type { z } from "zod";

describe("recipesPostHandler", () => {
  test("should create a recipe", async () => {
    const user = await createUserToDatabaseAndAuthenticate();

    const recipeData = {
      name: "Test Recipe",
      description: "Test Description",
      ingredientSections: [
        {
          name: "Test Section",
          ingredients: [
            {
              name: "Test Ingredient",
              quantity: 1,
              isOptional: true,
              unit: "BOTTLE",
            },
            {
              name: "Test Ingredient 2",
              quantity: 2,
              isOptional: false,
              unit: "CUP",
            },
          ],
        },
        {
          name: "Test Section 2",
          ingredients: [
            {
              name: "Test Ingredient 3",
              quantity: 3,
              isOptional: false,
              unit: "GALLON",
            },
          ],
        },
      ],
      instructions: [
        {
          description: "Test Instruction",
        },
        {
          description: "Test Instruction 2",
        },
      ],
      quantity: 4,
      visibility: RecipeVisibility.UNLISTED,
      hasCoverImage: false,
      tags: ["Test Tag", "Test Tag 2"],
      timeEstimateMaximumMinutes: 5,
      timeEstimateMinimumMinutes: 3,
    } satisfies z.infer<typeof recipesPostHandler.bodyValidator>;
    const createdRecipe = await recipesPostHandler.handler(user, recipeData);

    const recipe = await getSingleRecipeWithoutCoverImageUrl(
      createdRecipe.recipe.id,
    );

    if (!recipe) {
      throw new Error("Recipe not found. This should never happen.");
    }

    expect(recipe.name).toEqual(recipeData.name);
    expect(recipe.description).toEqual(recipeData.description);
    expect(recipe.quantity).toEqual(recipeData.quantity);
    expect(recipe.visibility).toEqual(recipeData.visibility);
    expect(recipe.timeEstimateMinimumMinutes).toEqual(
      recipeData.timeEstimateMinimumMinutes,
    );
    expect(recipe.timeEstimateMaximumMinutes).toEqual(
      recipeData.timeEstimateMaximumMinutes,
    );
    expect(recipe.tags).toHaveLength(recipeData.tags.length);
    expect(recipe.tags[0].text).toEqual(recipeData.tags[0]);
    expect(recipe.tags[1].text).toEqual(recipeData.tags[1]);
    expect(recipe.createdAt).toBeDefined();
    expect(recipe.updatedAt).toBeDefined();
    expect(recipe.userId).toEqual(user.userId);
    expect(recipe.coverImageName).toBeNull();
    expect(recipe.ingredientSections).toHaveLength(
      recipeData.ingredientSections.length,
    );
    expect(recipe.ingredientSections[0].name).toEqual(
      recipeData.ingredientSections[0].name,
    );
    expect(recipe.ingredientSections[0].ingredients).toHaveLength(
      recipeData.ingredientSections[0].ingredients.length,
    );
    expect(recipe.ingredientSections[0].ingredients[0].name).toEqual(
      recipeData.ingredientSections[0].ingredients[0].name,
    );
    expect(recipe.ingredientSections[0].ingredients[0].quantity).toEqual(
      recipeData.ingredientSections[0].ingredients[0].quantity,
    );
    expect(recipe.ingredientSections[0].ingredients[0].isOptional).toEqual(
      recipeData.ingredientSections[0].ingredients[0].isOptional,
    );
    expect(recipe.ingredientSections[0].ingredients[0].unit).toEqual(
      recipeData.ingredientSections[0].ingredients[0].unit,
    );
    expect(recipe.ingredientSections[0].ingredients[1].name).toEqual(
      recipeData.ingredientSections[0].ingredients[1].name,
    );
    expect(recipe.ingredientSections[0].ingredients[1].quantity).toEqual(
      recipeData.ingredientSections[0].ingredients[1].quantity,
    );
    expect(recipe.ingredientSections[0].ingredients[1].isOptional).toEqual(
      recipeData.ingredientSections[0].ingredients[1].isOptional,
    );
    expect(recipe.ingredientSections[0].ingredients[1].unit).toEqual(
      recipeData.ingredientSections[0].ingredients[1].unit,
    );
    expect(recipe.ingredientSections[1].name).toEqual(
      recipeData.ingredientSections[1].name,
    );
    expect(recipe.ingredientSections[1].ingredients).toHaveLength(
      recipeData.ingredientSections[1].ingredients.length,
    );
    expect(recipe.ingredientSections[1].ingredients[0].name).toEqual(
      recipeData.ingredientSections[1].ingredients[0].name,
    );
    expect(recipe.ingredientSections[1].ingredients[0].quantity).toEqual(
      recipeData.ingredientSections[1].ingredients[0].quantity,
    );
    expect(recipe.ingredientSections[1].ingredients[0].isOptional).toEqual(
      recipeData.ingredientSections[1].ingredients[0].isOptional,
    );
    expect(recipe.ingredientSections[1].ingredients[0].unit).toEqual(
      recipeData.ingredientSections[1].ingredients[0].unit,
    );

    expect(recipe.instructions).toHaveLength(recipeData.instructions.length);
    expect(recipe.instructions[0].description).toEqual(
      recipeData.instructions[0].description,
    );
    expect(recipe.instructions[1].description).toEqual(
      recipeData.instructions[1].description,
    );
    expect(recipe._count.likes).toBe(0);
    expect(recipe.viewCount).toBe(0);
    expect(recipe.user).toBeDefined();
    expect(recipe.user.clerkId).toEqual(user.userProfile.clerkId);
    expect(recipe.user.username).toEqual(user.userProfile.username);
  });
});
