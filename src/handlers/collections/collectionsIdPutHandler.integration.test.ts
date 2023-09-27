import { getCollectionWithoutCoverImages } from "../../database/collections";
import { createRecipe } from "../../database/recipes";
import {
  CollectionNotFoundError,
  RecipesMustBePublicError,
  RecipesMustBePublicOrUnlistedError,
  RecipesNotFoundError,
} from "../../utils/errors";
import { createRandomRecipe } from "../../utils/tests/recipes";
import { createUserToDatabaseAndAuthenticate } from "../../utils/tests/testUtils";
import { collectionsIdPutHandler } from "./collectionsIdPutHandler";
import { collectionsPostHandler } from "./collectionsPostHandler";
import { RecipeCollectionVisibility, RecipeVisibility } from "@prisma/client";

describe("collectionsIdPutHandler", () => {
  test("should change own collection's name and description", async () => {
    const user = await createUserToDatabaseAndAuthenticate();
    const originalCollection = await collectionsPostHandler.handler(user, {
      name: "test",
      recipeIds: [],
      visibility: "PUBLIC",
      description: "test",
    });

    await collectionsIdPutHandler.handler(
      user,
      {
        name: "test2",
        recipeIds: [],
        visibility: "PUBLIC",
        description: "test2",
      },
      { id: originalCollection.id },
    );

    const editedCollection = await getCollectionWithoutCoverImages(
      originalCollection.id,
    );

    expect(editedCollection).toBeDefined();
    if (editedCollection) {
      expect(editedCollection.name).toBe("test2");
      expect(editedCollection.description).toBe("test2");
    }
  });

  test("can not edit non-existent collection", async () => {
    const user = await createUserToDatabaseAndAuthenticate();

    await expect(
      collectionsIdPutHandler.handler(
        user,
        {
          name: "test2",
          recipeIds: [],
          visibility: "PUBLIC",
          description: "test2",
        },
        { id: "non-existent" },
      ),
    ).rejects.toThrowError(new CollectionNotFoundError("non-existent"));
  });

  test("can not edit other user's collection", async () => {
    const victim = await createUserToDatabaseAndAuthenticate();
    const attacker = await createUserToDatabaseAndAuthenticate();

    const originalCollection = await collectionsPostHandler.handler(victim, {
      name: "test",
      recipeIds: [],
      visibility: "PUBLIC",
      description: "test",
    });

    await expect(
      collectionsIdPutHandler.handler(
        attacker,
        {
          name: "test2",
          recipeIds: [],
          visibility: "PUBLIC",
          description: "test2",
        },
        { id: originalCollection.id },
      ),
    ).rejects.toThrowError(new CollectionNotFoundError(originalCollection.id));
  });

  test("can not add other users' private recipes to own collection", async () => {
    const victim = await createUserToDatabaseAndAuthenticate();
    const attacker = await createUserToDatabaseAndAuthenticate();

    const victimRecipe = await createRecipe(
      victim.userId,
      createRandomRecipe({
        visibility: RecipeVisibility.PRIVATE,
      }),
      null,
    );

    const attackerRecipe = await createRecipe(
      attacker.userId,
      createRandomRecipe({
        visibility: RecipeVisibility.PRIVATE,
      }),
      null,
    );

    const originalCollection = await collectionsPostHandler.handler(attacker, {
      name: "test",
      recipeIds: [],
      visibility: "PUBLIC",
      description: "test",
    });

    await expect(
      collectionsIdPutHandler.handler(
        attacker,
        {
          name: "test2",
          recipeIds: [victimRecipe.id, attackerRecipe.id],
          visibility: "PUBLIC",
          description: "test2",
        },
        { id: originalCollection.id },
      ),
    ).rejects.toThrowError(new RecipesNotFoundError([victimRecipe.id]));
  });

  test.each([
    [RecipeVisibility.PUBLIC, RecipeCollectionVisibility.PUBLIC, null],
    [RecipeVisibility.PUBLIC, RecipeCollectionVisibility.UNLISTED, null],
    [RecipeVisibility.PUBLIC, RecipeCollectionVisibility.PRIVATE, null],
    [
      RecipeVisibility.UNLISTED,
      RecipeCollectionVisibility.PUBLIC,
      RecipesMustBePublicError,
    ],
    [RecipeVisibility.UNLISTED, RecipeCollectionVisibility.UNLISTED, null],
    [RecipeVisibility.UNLISTED, RecipeCollectionVisibility.PRIVATE, null],
    [
      RecipeVisibility.PRIVATE,
      RecipeCollectionVisibility.PUBLIC,
      RecipesMustBePublicError,
    ],
    [
      RecipeVisibility.PRIVATE,
      RecipeCollectionVisibility.UNLISTED,
      RecipesMustBePublicOrUnlistedError,
    ],
    [RecipeVisibility.PRIVATE, RecipeCollectionVisibility.PRIVATE, null],
  ])(
    "should user be able to add own %s recipes to own %s collection: %s",
    async (recipeVisibility, recipeCollectionVisibility, errorType) => {
      const user = await createUserToDatabaseAndAuthenticate();

      const collection = await collectionsPostHandler.handler(user, {
        name: "test",
        recipeIds: [],
        visibility: recipeCollectionVisibility,
        description: "test",
      });

      const recipe = await createRecipe(
        user.userId,
        createRandomRecipe({
          visibility: recipeVisibility,
        }),
        null,
      );

      const fn = () =>
        collectionsIdPutHandler.handler(
          user,
          {
            name: "test2",
            recipeIds: [recipe.id],
            visibility: recipeCollectionVisibility,
            description: "test2",
          },
          { id: collection.id },
        );

      if (!errorType) {
        await fn();
        const editedCollection = await getCollectionWithoutCoverImages(
          collection.id,
        );

        expect(editedCollection).toBeDefined();
        if (editedCollection) {
          expect(editedCollection.RecipesOnCollections).toHaveLength(1);
          expect(editedCollection.RecipesOnCollections[0].recipeId).toBe(
            recipe.id,
          );
        }
      } else {
        const expectedError =
          errorType === RecipesMustBePublicError
            ? new RecipesMustBePublicError([recipe.id])
            : new RecipesMustBePublicOrUnlistedError([recipe.id]);

        await expect(fn).rejects.toThrowError(expectedError);
      }
    },
  );
});
