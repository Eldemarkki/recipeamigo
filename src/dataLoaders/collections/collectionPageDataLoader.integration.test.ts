import { createCollection } from "../../database/collections";
import { createRecipe } from "../../database/recipes";
import { CollectionNotFoundError } from "../../utils/errors";
import { createRandomRecipe } from "../../utils/tests/recipes";
import { createUserToDatabaseAndAuthenticate } from "../../utils/tests/testUtils";
import { collectionPageDataLoader } from "./collectionPageDataLoader";
import { RecipeCollectionVisibility, RecipeVisibility } from "@prisma/client";

describe("collectionPageDataLoader", () => {
  test.each([
    [RecipeCollectionVisibility.PUBLIC],
    [RecipeCollectionVisibility.UNLISTED],
    [RecipeCollectionVisibility.PRIVATE],
  ])(
    "should load user's own %s collections",
    async (recipeCollectionVisibility) => {
      const user = await createUserToDatabaseAndAuthenticate();
      const recipe1 = await createRecipe(
        user.userId,
        createRandomRecipe({
          visibility: RecipeVisibility.PUBLIC,
        }),
        null,
      );
      const recipe2 = await createRecipe(
        user.userId,
        createRandomRecipe({
          visibility: RecipeVisibility.PUBLIC,
        }),
        null,
      );

      const collection = await createCollection(user.userId, {
        name: "My Collection",
        description: "My collection description",
        visibility: recipeCollectionVisibility,
        recipeIds: [recipe1.id, recipe2.id],
      });

      const response = await collectionPageDataLoader.handler(user, {
        id: collection.id,
      });
      expect(response.isOwner).toBe(true);
      expect(response.collection).not.toBeNull();
      expect(response.collection.RecipesOnCollections).toHaveLength(2);
    },
  );

  test.each([
    [RecipeCollectionVisibility.PUBLIC, true],
    [RecipeCollectionVisibility.UNLISTED, true],
    [RecipeCollectionVisibility.PRIVATE, false],
  ])(
    "should load other people's %s collections",
    async (recipeCollectionVisibility, shouldLoad) => {
      const author = await createUserToDatabaseAndAuthenticate();
      const recipe1 = await createRecipe(
        author.userId,
        createRandomRecipe({
          visibility: RecipeVisibility.PUBLIC,
        }),
        null,
      );
      const recipe2 = await createRecipe(
        author.userId,
        createRandomRecipe({
          visibility: RecipeVisibility.PUBLIC,
        }),
        null,
      );

      const collection = await createCollection(author.userId, {
        name: "My Collection",
        description: "My collection description",
        visibility: recipeCollectionVisibility,
        recipeIds: [recipe1.id, recipe2.id],
      });

      const user = await createUserToDatabaseAndAuthenticate();

      if (shouldLoad) {
        const response = await collectionPageDataLoader.handler(user, {
          id: collection.id,
        });
        expect(response.isOwner).toBe(false);
        expect(response.collection).not.toBeNull();
        expect(response.collection.RecipesOnCollections).toHaveLength(2);
      } else {
        void expect(
          collectionPageDataLoader.handler(user, {
            id: collection.id,
          }),
        ).rejects.toThrowError(new CollectionNotFoundError(collection.id));
      }
    },
  );
});
