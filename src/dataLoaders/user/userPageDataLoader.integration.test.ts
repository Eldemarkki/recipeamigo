import { createCollection } from "../../database/collections";
import { createRecipe } from "../../database/recipes";
import { UserNotFoundError } from "../../utils/errors";
import { createRandomRecipe } from "../../utils/tests/recipes";
import { createUserToDatabaseAndAuthenticate } from "../../utils/tests/testUtils";
import { userPageDataLoader } from "./userPageDataLoader";
import { RecipeCollectionVisibility, RecipeVisibility } from "@prisma/client";

describe("userPageDataLoader", () => {
  test("loads public data for own user", async () => {
    const user = await createUserToDatabaseAndAuthenticate();

    const recipes = await Promise.all(
      [
        RecipeVisibility.PUBLIC,
        RecipeVisibility.UNLISTED,
        RecipeVisibility.PRIVATE,
      ].map((visibility) =>
        createRecipe(
          user.userId,
          createRandomRecipe({
            visibility,
          }),
          null,
        ),
      ),
    );

    const collections = await Promise.all(
      [
        RecipeCollectionVisibility.PUBLIC,
        RecipeCollectionVisibility.UNLISTED,
        RecipeCollectionVisibility.PRIVATE,
      ].map((visibility) =>
        createCollection(user.userId, {
          name: "test " + visibility,
          recipeIds: [],
          description: "test " + visibility,
          visibility,
        }),
      ),
    );

    const data = await userPageDataLoader.handler(user, {
      username: user.userProfile.username,
    });

    expect(data.user.clerkId).toBe(user.userProfile.clerkId);
    expect(data.user.username).toBe(user.userProfile.username);
    expect(data.user.recipes).toHaveLength(1);
    expect(data.user.recipes[0].visibility).toBe(RecipeVisibility.PUBLIC);
    expect(data.user.recipes[0].name).toBe(recipes[0].name);
    expect(data.user.recipeCollections).toHaveLength(1);
    expect(data.user.recipeCollections[0].visibility).toBe(
      RecipeCollectionVisibility.PUBLIC,
    );
    expect(data.user.recipeCollections[0].name).toBe(collections[0].name);
  });

  test("loads public data for other user", async () => {
    const victim = await createUserToDatabaseAndAuthenticate();

    const recipes = await Promise.all(
      [
        RecipeVisibility.PUBLIC,
        RecipeVisibility.UNLISTED,
        RecipeVisibility.PRIVATE,
      ].map((visibility) =>
        createRecipe(
          victim.userId,
          createRandomRecipe({
            visibility,
          }),
          null,
        ),
      ),
    );

    const collections = await Promise.all(
      [
        RecipeCollectionVisibility.PUBLIC,
        RecipeCollectionVisibility.UNLISTED,
        RecipeCollectionVisibility.PRIVATE,
      ].map((visibility) =>
        createCollection(victim.userId, {
          name: "test " + visibility,
          recipeIds: [],
          description: "test " + visibility,
          visibility,
        }),
      ),
    );

    const attacker = await createUserToDatabaseAndAuthenticate();

    const data = await userPageDataLoader.handler(attacker, {
      username: victim.userProfile.username,
    });

    expect(data.user.clerkId).toBe(victim.userProfile.clerkId);
    expect(data.user.username).toBe(victim.userProfile.username);
    expect(data.user.recipes).toHaveLength(1);
    expect(data.user.recipes[0].visibility).toBe(RecipeVisibility.PUBLIC);
    expect(data.user.recipes[0].name).toBe(recipes[0].name);
    expect(data.user.recipeCollections).toHaveLength(1);
    expect(data.user.recipeCollections[0].visibility).toBe(
      RecipeCollectionVisibility.PUBLIC,
    );
    expect(data.user.recipeCollections[0].name).toBe(collections[0].name);
  });

  test("throws error for non-existent user", async () => {
    const user = await createUserToDatabaseAndAuthenticate();

    await expect(
      userPageDataLoader.handler(user, {
        username: "non-existent-user",
      }),
    ).rejects.toThrow(new UserNotFoundError("non-existent-user"));
  });
});
