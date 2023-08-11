import { createCollection } from "../../database/collections";
import { createRecipe } from "../../database/recipes";
import { RecipeNotFoundError } from "../../utils/errors";
import { createRandomRecipe } from "../../utils/tests/recipes";
import { createUserToDatabaseAndAuthenticate } from "../../utils/tests/testUtils";
import { recipePageDataLoader } from "./recipePageDataLoader";
import { RecipeVisibility } from "@prisma/client";

describe("recipePageDataLoader", () => {
  it("should load the recipe if user is owner", async () => {
    const user = await createUserToDatabaseAndAuthenticate();
    const recipe = await createRecipe(
      user.userId,
      createRandomRecipe({
        name: "Test Recipe",
      }),
      null,
    );

    const response = await recipePageDataLoader.handler(user, {
      id: recipe.id,
    });

    expect(response.recipe.name).toEqual("Test Recipe");
    expect(response.recipe.userId).toEqual(user.userId);
    expect(response.recipe.id).toEqual(recipe.id);
    expect(response.userId).toEqual(user.userId);
  });

  test.each([RecipeVisibility.PUBLIC, RecipeVisibility.UNLISTED])(
    "should load the recipe if user is not owner but recipe is %s",
    async (recipeVisibility) => {
      const user = await createUserToDatabaseAndAuthenticate();
      const recipe = await createRecipe(
        user.userId,
        createRandomRecipe({
          name: "Test Recipe",
          visibility: recipeVisibility,
        }),
        null,
      );

      const visitingUser = await createUserToDatabaseAndAuthenticate();
      const response = await recipePageDataLoader.handler(visitingUser, {
        id: recipe.id,
      });

      expect(response.recipe.name).toEqual("Test Recipe");
      expect(response.recipe.userId).toEqual(user.userId);
      expect(response.recipe.id).toEqual(recipe.id);
      expect(response.userId).toEqual(visitingUser.userId);
    },
  );

  test("should not load the recipe if user is not owner and recipe is private", async () => {
    const user = await createUserToDatabaseAndAuthenticate();
    const recipe = await createRecipe(
      user.userId,
      createRandomRecipe({
        name: "Test Recipe",
        visibility: RecipeVisibility.PRIVATE,
      }),
      null,
    );

    const visitingUser = await createUserToDatabaseAndAuthenticate();
    await expect(
      recipePageDataLoader.handler(visitingUser, {
        id: recipe.id,
      }),
    ).rejects.toThrowError(new RecipeNotFoundError(recipe.id));
  });

  test("if user is not logged in, userId should be null", async () => {
    const user = await createUserToDatabaseAndAuthenticate();
    const recipe = await createRecipe(
      user.userId,
      createRandomRecipe({
        name: "Test Recipe",
        visibility: RecipeVisibility.PUBLIC,
      }),
      null,
    );

    const response = await recipePageDataLoader.handler(null, {
      id: recipe.id,
    });

    expect(response.recipe.name).toEqual("Test Recipe");
    expect(response.recipe.userId).toEqual(user.userId);
    expect(response.recipe.id).toEqual(recipe.id);
    expect(response.userId).toEqual(null);
  });

  test("when recipe belongs to two collections, they should be returned", async () => {
    const user = await createUserToDatabaseAndAuthenticate();
    const recipe = await createRecipe(
      user.userId,
      createRandomRecipe({
        name: "Test Recipe",
        visibility: RecipeVisibility.PUBLIC,
      }),
      null,
    );

    const collection1 = await createCollection(user.userId, {
      name: "Test Collection 1",
      visibility: RecipeVisibility.PUBLIC,
      recipeIds: [recipe.id],
    });
    const collection2 = await createCollection(user.userId, {
      name: "Test Collection 2",
      visibility: RecipeVisibility.PUBLIC,
      recipeIds: [recipe.id],
    });

    const response = await recipePageDataLoader.handler(user, {
      id: recipe.id,
    });

    expect(response.recipe.name).toEqual("Test Recipe");
    expect(response.recipe.userId).toEqual(user.userId);
    expect(response.recipe.id).toEqual(recipe.id);
    expect(response.userId).toEqual(user.userId);
    expect(response.collectionRelationships).toHaveLength(2);
    if (response.collectionRelationships) {
      expect(
        response.collectionRelationships
          .map((r) => r.recipeCollectionId)
          .sort(),
      ).toEqual([collection1.id, collection2.id].sort());
    }
  });

  test("when recipe belongs to user's own collection and another user's collection, only the own collection should be returned", async () => {
    const user = await createUserToDatabaseAndAuthenticate();
    const recipe = await createRecipe(
      user.userId,
      createRandomRecipe({
        name: "Test Recipe",
        visibility: RecipeVisibility.PUBLIC,
      }),
      null,
    );

    await createCollection(user.userId, {
      name: "Test Collection 1",
      visibility: RecipeVisibility.PUBLIC,
      recipeIds: [recipe.id],
    });

    const user2 = await createUserToDatabaseAndAuthenticate();
    const collection2 = await createCollection(user2.userId, {
      name: "Test Collection 2",
      visibility: RecipeVisibility.PUBLIC,
      recipeIds: [recipe.id],
    });

    const response = await recipePageDataLoader.handler(user2, {
      id: recipe.id,
    });

    expect(response.recipe.name).toEqual("Test Recipe");
    expect(response.recipe.userId).toEqual(user.userId);
    expect(response.recipe.id).toEqual(recipe.id);
    expect(response.userId).toEqual(user2.userId);
    expect(response.collectionRelationships).toHaveLength(1);
    if (response.collectionRelationships) {
      expect(response.collectionRelationships[0].recipeCollectionId).toEqual(
        collection2.id,
      );
    }
  });
});
