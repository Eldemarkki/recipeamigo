import { createCollection } from "../../../database/collections";
import { createRecipe } from "../../../database/recipes";
import { resetDatabase } from "../../../db";
import { createRandomRecipe } from "../../../utils/tests/recipes";
import { createUserToDatabaseAndAuthenticate } from "../../../utils/tests/testUtils";
import { browseCollectionsDataLoader } from "./browseCollectionsDataLoader";
import { RecipeVisibility } from "@prisma/client";

describe("browseCollectionsDataLoader", () => {
  test("returns only public collections for anonymous user", async () => {
    // This test depends on global database state
    await resetDatabase();

    const user = await createUserToDatabaseAndAuthenticate();
    const recipe = await createRecipe(
      user.userId,
      createRandomRecipe({
        name: "Public recipe",
        visibility: RecipeVisibility.PUBLIC,
      }),
      null,
    );

    const publicCollection = await createCollection(user.userId, {
      name: "Public collection",
      visibility: RecipeVisibility.PUBLIC,
      recipeIds: [recipe.id],
      description: "Public collection description",
    });
    await createCollection(user.userId, {
      name: "Unlisted collection",
      visibility: RecipeVisibility.UNLISTED,
      recipeIds: [recipe.id],
      description: "Unlisted collection description",
    });
    await createCollection(user.userId, {
      name: "Private collection",
      visibility: RecipeVisibility.PRIVATE,
      recipeIds: [recipe.id],
      description: "Private collection description",
    });

    const response = await browseCollectionsDataLoader.handler(null);

    expect(response.publicCollections).toHaveLength(1);
    expect(response.publicCollections[0].id).toEqual(publicCollection.id);
    expect(response.userCollections).toBeNull();
  });

  test("returns all of user's collections + all public collections for authenticated user", async () => {
    // This test depends on global database state
    await resetDatabase();

    const user = await createUserToDatabaseAndAuthenticate();
    const recipe = await createRecipe(
      user.userId,
      createRandomRecipe({
        name: "Public recipe",
        visibility: RecipeVisibility.PUBLIC,
      }),
      null,
    );

    const publicCollection = await createCollection(user.userId, {
      name: "Public collection",
      visibility: RecipeVisibility.PUBLIC,
      recipeIds: [recipe.id],
      description: "Public collection description",
    });
    const unlistedCollection = await createCollection(user.userId, {
      name: "Unlisted collection",
      visibility: RecipeVisibility.UNLISTED,
      recipeIds: [recipe.id],
      description: "Unlisted collection description",
    });
    const privateCollection = await createCollection(user.userId, {
      name: "Private collection",
      visibility: RecipeVisibility.PRIVATE,
      recipeIds: [recipe.id],
      description: "Private collection description",
    });

    const user2 = await createUserToDatabaseAndAuthenticate();
    const user2collection = await createCollection(user2.userId, {
      name: "User 2 collection",
      visibility: RecipeVisibility.PUBLIC,
      recipeIds: [recipe.id],
      description: "User 2 collection description",
    });

    await createCollection(user2.userId, {
      name: "User 2 private collection",
      visibility: RecipeVisibility.PRIVATE,
      recipeIds: [recipe.id],
      description: "User 2 private collection description",
    });

    await createCollection(user2.userId, {
      name: "User 2 unlisted collection",
      visibility: RecipeVisibility.UNLISTED,
      recipeIds: [recipe.id],
      description: "User 2 unlisted collection description",
    });

    const response = await browseCollectionsDataLoader.handler(user);

    expect(response.publicCollections).toHaveLength(2);

    // .sort() is necessary because we don't care about the order
    expect(response.publicCollections.map((x) => x.id).sort()).toMatchObject(
      [publicCollection.id, user2collection.id].sort(),
    );

    expect(response.userCollections).not.toBeNull();
    if (response.userCollections) {
      expect(response.userCollections).toHaveLength(3);
      expect(response.userCollections.map((x) => x.id).sort()).toMatchObject(
        [
          publicCollection.id,
          unlistedCollection.id,
          privateCollection.id,
        ].sort(),
      );
    }
  });
});
