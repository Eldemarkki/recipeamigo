import { getUserCollections } from "../../database/collections";
import { createRecipe } from "../../database/recipes";
import {
  RecipesMustBePublicError,
  RecipesMustBePublicOrUnlistedError,
  RecipesNotFoundError,
} from "../../utils/errors";
import { createRandomRecipe } from "../../utils/tests/recipes";
import { createUserToDatabaseAndAuthenticate } from "../../utils/tests/testUtils";
import { collectionsPostHandler } from "./collectionsPostHandler";
import { RecipeCollectionVisibility, RecipeVisibility } from "@prisma/client";

describe("collectionsPostHandler", () => {
  test("should create collection with no recipes", async () => {
    const user = await createUserToDatabaseAndAuthenticate();
    await collectionsPostHandler.handler(user, {
      name: "test",
      description: "test",
      visibility: RecipeCollectionVisibility.PUBLIC,
      recipeIds: [],
    });

    const collections = await getUserCollections(user.userId);
    expect(collections).toHaveLength(1);
  });

  test("should create collection with 1 recipe", async () => {
    const user = await createUserToDatabaseAndAuthenticate();

    const recipe = await createRecipe(
      user.userId,
      createRandomRecipe({
        visibility: RecipeVisibility.PUBLIC,
      }),
      null,
    );

    await collectionsPostHandler.handler(user, {
      name: "test",
      description: "test",
      visibility: RecipeCollectionVisibility.PUBLIC,
      recipeIds: [recipe.id],
    });

    const collections = await getUserCollections(user.userId);
    expect(collections).toHaveLength(1);
    expect(collections[0]?._count.RecipesOnCollections).toBe(1);
  });

  test.each([
    [
      RecipeVisibility.PUBLIC,
      RecipeVisibility.PUBLIC,
      RecipeCollectionVisibility.PUBLIC,
      true,
      null,
    ],
    [
      RecipeVisibility.PUBLIC,
      RecipeVisibility.PUBLIC,
      RecipeCollectionVisibility.UNLISTED,
      true,
      null,
    ],
    [
      RecipeVisibility.PUBLIC,
      RecipeVisibility.PUBLIC,
      RecipeCollectionVisibility.PRIVATE,
      true,
      null,
    ],
    [
      RecipeVisibility.PUBLIC,
      RecipeVisibility.UNLISTED,
      RecipeCollectionVisibility.PUBLIC,
      false,
      RecipesMustBePublicError,
    ],
    [
      RecipeVisibility.PUBLIC,
      RecipeVisibility.UNLISTED,
      RecipeCollectionVisibility.UNLISTED,
      true,
      null,
    ],
    [
      RecipeVisibility.PUBLIC,
      RecipeVisibility.UNLISTED,
      RecipeCollectionVisibility.PRIVATE,
      true,
      null,
    ],
    [
      RecipeVisibility.PUBLIC,
      RecipeVisibility.PRIVATE,
      RecipeCollectionVisibility.PUBLIC,
      false,
      RecipesNotFoundError,
    ],
    [
      RecipeVisibility.PUBLIC,
      RecipeVisibility.PRIVATE,
      RecipeCollectionVisibility.UNLISTED,
      false,
      RecipesNotFoundError,
    ],
    [
      RecipeVisibility.PUBLIC,
      RecipeVisibility.PRIVATE,
      RecipeCollectionVisibility.PRIVATE,
      false,
      RecipesNotFoundError,
    ],
    [
      RecipeVisibility.UNLISTED,
      RecipeVisibility.PUBLIC,
      RecipeCollectionVisibility.PUBLIC,
      false,
      RecipesMustBePublicError,
    ],
    [
      RecipeVisibility.UNLISTED,
      RecipeVisibility.PUBLIC,
      RecipeCollectionVisibility.UNLISTED,
      true,
      null,
    ],
    [
      RecipeVisibility.UNLISTED,
      RecipeVisibility.PUBLIC,
      RecipeCollectionVisibility.PRIVATE,
      true,
      null,
    ],
    [
      RecipeVisibility.UNLISTED,
      RecipeVisibility.UNLISTED,
      RecipeCollectionVisibility.PUBLIC,
      false,
      RecipesMustBePublicError,
    ],
    [
      RecipeVisibility.UNLISTED,
      RecipeVisibility.UNLISTED,
      RecipeCollectionVisibility.UNLISTED,
      true,
      null,
    ],
    [
      RecipeVisibility.UNLISTED,
      RecipeVisibility.UNLISTED,
      RecipeCollectionVisibility.PRIVATE,
      true,
      null,
    ],
    [
      RecipeVisibility.UNLISTED,
      RecipeVisibility.PRIVATE,
      RecipeCollectionVisibility.PUBLIC,
      false,
      RecipesNotFoundError,
    ],
    [
      RecipeVisibility.UNLISTED,
      RecipeVisibility.PRIVATE,
      RecipeCollectionVisibility.UNLISTED,
      false,
      RecipesNotFoundError,
    ],
    [
      RecipeVisibility.UNLISTED,
      RecipeVisibility.PRIVATE,
      RecipeCollectionVisibility.PRIVATE,
      false,
      RecipesNotFoundError,
    ],
    [
      RecipeVisibility.PRIVATE,
      RecipeVisibility.PUBLIC,
      RecipeCollectionVisibility.PUBLIC,
      false,
      RecipesMustBePublicError,
    ],
    [
      RecipeVisibility.PRIVATE,
      RecipeVisibility.PUBLIC,
      RecipeCollectionVisibility.UNLISTED,
      false,
      RecipesMustBePublicOrUnlistedError,
    ],
    [
      RecipeVisibility.PRIVATE,
      RecipeVisibility.PUBLIC,
      RecipeCollectionVisibility.PRIVATE,
      true,
      null,
    ],
    [
      RecipeVisibility.PRIVATE,
      RecipeVisibility.UNLISTED,
      RecipeCollectionVisibility.PUBLIC,
      false,
      RecipesMustBePublicError,
    ],
    [
      RecipeVisibility.PRIVATE,
      RecipeVisibility.UNLISTED,
      RecipeCollectionVisibility.UNLISTED,
      false,
      RecipesMustBePublicOrUnlistedError,
    ],
    [
      RecipeVisibility.PRIVATE,
      RecipeVisibility.UNLISTED,
      RecipeCollectionVisibility.PRIVATE,
      true,
      null,
    ],
    [
      RecipeVisibility.PRIVATE,
      RecipeVisibility.PRIVATE,
      RecipeCollectionVisibility.PUBLIC,
      false,
      RecipesNotFoundError,
    ],
    [
      RecipeVisibility.PRIVATE,
      RecipeVisibility.PRIVATE,
      RecipeCollectionVisibility.UNLISTED,
      false,
      RecipesNotFoundError,
    ],
    [
      RecipeVisibility.PRIVATE,
      RecipeVisibility.PRIVATE,
      RecipeCollectionVisibility.PRIVATE,
      false,
      RecipesNotFoundError,
    ],
  ] as const)(
    "user can include own %s recipe and other users' %s recipes in their own %s collection",
    async (
      ownRecipeVisibility,
      otherRecipeVisibility,
      collectionVisibility,
      shouldWork,
      e,
    ) => {
      const user = await createUserToDatabaseAndAuthenticate();
      const user2 = await createUserToDatabaseAndAuthenticate();

      const recipe1 = await createRecipe(
        user.userId,
        createRandomRecipe({
          visibility: ownRecipeVisibility,
        }),
        null,
      );

      const recipe2 = await createRecipe(
        user2.userId,
        createRandomRecipe({
          visibility: otherRecipeVisibility,
        }),
        null,
      );

      const createCollectionWithParameters = () =>
        collectionsPostHandler.handler(user, {
          name: "test",
          description: "test",
          visibility: collectionVisibility,
          recipeIds: [recipe1.id, recipe2.id],
        });

      if (shouldWork) {
        const collection = await createCollectionWithParameters();
        expect(collection).not.toBeNull();
      } else {
        await expect(createCollectionWithParameters).rejects.toThrowError(
          e ?? undefined,
        );
        const userCollections = await getUserCollections(user.userId);
        expect(userCollections).toHaveLength(0);
      }
    },
  );

  test("should not create collection with non-existent recipe", async () => {
    const user = await createUserToDatabaseAndAuthenticate();
    await expect(
      collectionsPostHandler.handler(user, {
        name: "test",
        description: "test",
        visibility: RecipeCollectionVisibility.PUBLIC,
        recipeIds: ["non-existent-recipe"],
      }),
    ).rejects.toThrowError(new RecipesNotFoundError(["non-existent-recipe"]));

    const collections = await getUserCollections(user.userId);
    expect(collections).toHaveLength(0);
  });
});
