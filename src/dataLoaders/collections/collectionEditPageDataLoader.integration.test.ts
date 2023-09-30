import { createCollection } from "../../database/collections";
import { createRecipe } from "../../database/recipes";
import { CollectionNotFoundError } from "../../utils/errors";
import { createRandomRecipe } from "../../utils/tests/recipes";
import { createUserToDatabaseAndAuthenticate } from "../../utils/tests/testUtils";
import { collectionEditPageDataLoader } from "./collectionEditPageDataLoader";
import { RecipeCollectionVisibility, RecipeVisibility } from "@prisma/client";

describe("collectionEditPageDataLoader", () => {
  test("loads collection data for own collection", async () => {
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
      name: "test collection",
      recipeIds: [recipe1.id],
      description: "test collection",
      visibility: RecipeCollectionVisibility.PUBLIC,
    });

    const data = await collectionEditPageDataLoader.handler(user, {
      id: collection.id,
    });

    expect(data.collection.name).toBe(collection.name);
    expect(data.collection.description).toBe(collection.description);
    expect(data.collection.visibility).toBe(collection.visibility);
    expect(data.collection.RecipesOnCollections).toHaveLength(1);
    expect(data.collection.RecipesOnCollections[0].recipeId).toBe(recipe1.id);
    expect(data.allRecipes).toHaveLength(2);
    expect(data.allRecipes[0].id).toBe(recipe1.id);
    expect(data.allRecipes[1].id).toBe(recipe2.id);
  });

  test.each([
    RecipeCollectionVisibility.PUBLIC,
    RecipeCollectionVisibility.UNLISTED,
    RecipeCollectionVisibility.PRIVATE,
  ])(
    "doesn't load collection data for other user's %s collection",
    async (visibility) => {
      const victim = await createUserToDatabaseAndAuthenticate();

      const collection = await createCollection(victim.userId, {
        name: "test collection",
        recipeIds: [],
        description: "test collection",
        visibility,
      });

      const attacker = await createUserToDatabaseAndAuthenticate();

      await expect(
        collectionEditPageDataLoader.handler(attacker, {
          id: collection.id,
        }),
      ).rejects.toThrowError(new CollectionNotFoundError(collection.id));
    },
  );

  test("throws error for non-existent collection", async () => {
    const user = await createUserToDatabaseAndAuthenticate();

    await expect(
      collectionEditPageDataLoader.handler(user, {
        id: "non-existent-collection",
      }),
    ).rejects.toThrowError(
      new CollectionNotFoundError("non-existent-collection"),
    );
  });
});
