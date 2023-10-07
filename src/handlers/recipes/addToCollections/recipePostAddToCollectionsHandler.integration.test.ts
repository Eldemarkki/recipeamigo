import { createCollection, getCollection } from "../../../database/collections";
import { createRecipe } from "../../../database/recipes";
import {
  CannotAddRecipeToCollectionsDontExistOrNoReadAccessError,
  CannotAddRecipeToCollectionsInvalidVisibilityError,
  CannotAddRecipeToCollectionsNoWriteAccessError,
} from "../../../utils/errors";
import { createRandomRecipe } from "../../../utils/tests/recipes";
import { createUserToDatabaseAndAuthenticate } from "../../../utils/tests/testUtils";
import { recipePostAddToCollectionsHandler } from "./recipePostAddToCollectionsHandler";
import { RecipeCollectionVisibility, RecipeVisibility } from "@prisma/client";

describe("recipePostAddToCollectionsHandler", () => {
  test("can add own recipe to own collection", async () => {
    const user = await createUserToDatabaseAndAuthenticate();

    const recipe = await createRecipe(
      user.userId,
      createRandomRecipe({ visibility: RecipeVisibility.PUBLIC }),
      null,
    );

    const collection = await createCollection(user.userId, {
      name: "Test collection",
      recipeIds: [],
      visibility: RecipeVisibility.PRIVATE,
    });

    await recipePostAddToCollectionsHandler.handler(
      user,
      {
        collectionIds: [collection.id],
      },
      {
        id: recipe.id,
      },
    );

    const fetchedCollection = await getCollection(collection.id);
    expect(fetchedCollection).not.toBeNull();
    if (fetchedCollection) {
      expect(fetchedCollection.RecipesOnCollections).toHaveLength(1);
      expect(
        fetchedCollection.RecipesOnCollections.map((x) => x.recipeId),
      ).toContain(recipe.id);
    }
  });

  test("can not add own public recipe to someone else's private collection", async () => {
    const user = await createUserToDatabaseAndAuthenticate();
    const recipe = await createRecipe(
      user.userId,
      createRandomRecipe({ visibility: RecipeVisibility.PUBLIC }),
      null,
    );

    const user2 = await createUserToDatabaseAndAuthenticate();
    const collection = await createCollection(user2.userId, {
      name: "Test collection",
      recipeIds: [],
      visibility: RecipeVisibility.PRIVATE,
    });

    await expect(
      recipePostAddToCollectionsHandler.handler(
        user,
        {
          collectionIds: [collection.id],
        },
        {
          id: recipe.id,
        },
      ),
    ).rejects.toThrowError(
      new CannotAddRecipeToCollectionsDontExistOrNoReadAccessError(recipe.id, [
        collection.id,
      ]),
    );

    const fetchedCollection = await getCollection(collection.id);
    expect(fetchedCollection).not.toBeNull();
    if (fetchedCollection) {
      expect(fetchedCollection.RecipesOnCollections).toHaveLength(0);
    }
  });

  test.each([
    RecipeCollectionVisibility.PUBLIC,
    RecipeCollectionVisibility.UNLISTED,
  ])(
    "can not add own public recipe to someone else's %s collection",
    async (recipeCollectionVisibility) => {
      const user = await createUserToDatabaseAndAuthenticate();
      const recipe = await createRecipe(
        user.userId,
        createRandomRecipe({ visibility: RecipeVisibility.PUBLIC }),
        null,
      );

      const user2 = await createUserToDatabaseAndAuthenticate();
      const collection = await createCollection(user2.userId, {
        name: "Test collection",
        recipeIds: [],
        visibility: recipeCollectionVisibility,
      });

      await expect(
        recipePostAddToCollectionsHandler.handler(
          user,
          {
            collectionIds: [collection.id],
          },
          {
            id: recipe.id,
          },
        ),
      ).rejects.toThrowError(
        new CannotAddRecipeToCollectionsNoWriteAccessError(recipe.id, [
          collection.id,
        ]),
      );

      const fetchedCollection = await getCollection(collection.id);
      expect(fetchedCollection).not.toBeNull();
      if (fetchedCollection) {
        expect(fetchedCollection.RecipesOnCollections).toHaveLength(0);
      }
    },
  );

  test("can not add someone else's public recipe to someone else's public collection", async () => {
    const user2 = await createUserToDatabaseAndAuthenticate();
    const recipe = await createRecipe(
      user2.userId,
      createRandomRecipe({ visibility: RecipeVisibility.PUBLIC }),
      null,
    );

    const collection = await createCollection(user2.userId, {
      name: "Test collection",
      recipeIds: [],
      visibility: RecipeCollectionVisibility.PUBLIC,
    });

    const user = await createUserToDatabaseAndAuthenticate();
    await expect(
      recipePostAddToCollectionsHandler.handler(
        user,
        {
          collectionIds: [collection.id],
        },
        {
          id: recipe.id,
        },
      ),
    ).rejects.toThrowError(
      new CannotAddRecipeToCollectionsNoWriteAccessError(recipe.id, [
        collection.id,
      ]),
    );

    const fetchedCollection = await getCollection(collection.id);
    expect(fetchedCollection).not.toBeNull();
    if (fetchedCollection) {
      expect(fetchedCollection.RecipesOnCollections).toHaveLength(0);
    }
  });

  test.each([
    [RecipeVisibility.PUBLIC, RecipeCollectionVisibility.PUBLIC, true],
    [RecipeVisibility.PUBLIC, RecipeCollectionVisibility.UNLISTED, true],
    [RecipeVisibility.PUBLIC, RecipeCollectionVisibility.PRIVATE, true],
    [RecipeVisibility.UNLISTED, RecipeCollectionVisibility.PUBLIC, false],
    [RecipeVisibility.UNLISTED, RecipeCollectionVisibility.UNLISTED, true],
    [RecipeVisibility.UNLISTED, RecipeCollectionVisibility.PRIVATE, true],
    [RecipeVisibility.PRIVATE, RecipeCollectionVisibility.PUBLIC, false],
    [RecipeVisibility.PRIVATE, RecipeCollectionVisibility.UNLISTED, false],
    [RecipeVisibility.PRIVATE, RecipeCollectionVisibility.PRIVATE, true],
  ])(
    "can not add own public/unlisted/private to own public/unlisted/private collection",
    async (recipeVisibility, collectionVisibility, canAdd) => {
      const user = await createUserToDatabaseAndAuthenticate();
      const recipe = await createRecipe(
        user.userId,
        createRandomRecipe({ visibility: recipeVisibility }),
        null,
      );

      const collection = await createCollection(user.userId, {
        name: "Test collection",
        recipeIds: [],
        visibility: collectionVisibility,
      });

      if (canAdd) {
        await recipePostAddToCollectionsHandler.handler(
          user,
          {
            collectionIds: [collection.id],
          },
          {
            id: recipe.id,
          },
        );

        const fetchedCollection = await getCollection(collection.id);
        expect(fetchedCollection).not.toBeNull();
        if (fetchedCollection) {
          expect(fetchedCollection.RecipesOnCollections).toHaveLength(1);
          expect(
            fetchedCollection.RecipesOnCollections.map((x) => x.recipeId),
          ).toContain(recipe.id);
        }
      } else {
        await expect(
          recipePostAddToCollectionsHandler.handler(
            user,
            {
              collectionIds: [collection.id],
            },
            {
              id: recipe.id,
            },
          ),
        ).rejects.toThrowError(
          new CannotAddRecipeToCollectionsInvalidVisibilityError(recipe.id, [
            collection.id,
          ]),
        );
      }
    },
  );

  test("adding a recipe to a collection doesn't affect other people's collections", async () => {
    const user = await createUserToDatabaseAndAuthenticate();
    const recipe = await createRecipe(
      user.userId,
      createRandomRecipe({ visibility: RecipeVisibility.PUBLIC }),
      null,
    );
    const collection = await createCollection(user.userId, {
      name: "Test collection",
      recipeIds: [],
      visibility: RecipeCollectionVisibility.PUBLIC,
    });

    await recipePostAddToCollectionsHandler.handler(
      user,
      {
        collectionIds: [collection.id],
      },
      {
        id: recipe.id,
      },
    );

    const user2 = await createUserToDatabaseAndAuthenticate();
    const collection2 = await createCollection(user2.userId, {
      name: "Test collection",
      recipeIds: [],
      visibility: RecipeCollectionVisibility.PUBLIC,
    });

    await recipePostAddToCollectionsHandler.handler(
      user2,
      {
        collectionIds: [collection2.id],
      },
      {
        id: recipe.id,
      },
    );

    const fetchedCollection = await getCollection(collection.id);
    expect(fetchedCollection).not.toBeNull();
    if (fetchedCollection) {
      expect(fetchedCollection.RecipesOnCollections).toHaveLength(1);
      expect(
        fetchedCollection.RecipesOnCollections.map((x) => x.recipeId),
      ).toContain(recipe.id);
    }

    const fetchedCollection2 = await getCollection(collection2.id);
    expect(fetchedCollection2).not.toBeNull();
    if (fetchedCollection2) {
      expect(fetchedCollection2.RecipesOnCollections).toHaveLength(1);
      expect(
        fetchedCollection2.RecipesOnCollections.map((x) => x.recipeId),
      ).toContain(recipe.id);
    }

    // User 1 removes the recipe from their collection
    await recipePostAddToCollectionsHandler.handler(
      user,
      {
        collectionIds: [],
      },
      {
        id: recipe.id,
      },
    );

    const fetchedCollectionAfterRemove = await getCollection(collection.id);
    expect(fetchedCollectionAfterRemove).not.toBeNull();
    if (fetchedCollectionAfterRemove) {
      expect(fetchedCollectionAfterRemove.RecipesOnCollections).toHaveLength(0);
    }

    // User 2's collection should still have the recipe
    const fetchedCollection2AfterRemove = await getCollection(collection2.id);
    expect(fetchedCollection2AfterRemove).not.toBeNull();
    if (fetchedCollection2AfterRemove) {
      expect(fetchedCollection2AfterRemove.RecipesOnCollections).toHaveLength(
        1,
      );
      expect(
        fetchedCollection2AfterRemove.RecipesOnCollections.map(
          (x) => x.recipeId,
        ),
      ).toContain(recipe.id);
    }
  });
});
