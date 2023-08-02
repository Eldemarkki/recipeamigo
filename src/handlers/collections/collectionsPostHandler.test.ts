import { getUserCollections } from "../../database/collections";
import { createRecipe } from "../../database/recipes";
import { createRandomRecipe } from "../../utils/tests/recipes";
import { createUserToDatabaseAndAuthenticate } from "../../utils/tests/testUtils";
import { collectionsPostHandler } from "./collectionsPostHandler";
import { RecipeVisibility } from "@prisma/client";

describe("collectionsPostHandler", () => {
  test("should create collection with no recipes", async () => {
    const user = await createUserToDatabaseAndAuthenticate();
    await collectionsPostHandler(user, {
      name: "test",
      description: "test",
      visibility: "PUBLIC",
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

    await collectionsPostHandler(user, {
      name: "test",
      description: "test",
      visibility: "PUBLIC",
      recipeIds: [recipe.id],
    });

    const collections = await getUserCollections(user.userId);
    expect(collections).toHaveLength(1);
    expect(collections[0]?._count.RecipesOnCollections).toBe(1);
  });

  test("should not be able to create public collection with private recipe", async () => {
    const user = await createUserToDatabaseAndAuthenticate();

    const recipe = await createRecipe(
      user.userId,
      createRandomRecipe({
        visibility: RecipeVisibility.PRIVATE,
      }),
      null,
    );

    await expect(
      collectionsPostHandler(user, {
        name: "test",
        description: "test",
        visibility: "PUBLIC",
        recipeIds: [recipe.id],
      }),
    ).rejects.toThrowError();
  });
});
