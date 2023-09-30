import {
  createRecipe,
  getSingleRecipeWithoutCoverImageUrl,
} from "../../../database/recipes";
import {
  CannotLikeOwnRecipeError,
  RecipeAlreadyLikedError,
  RecipeNotFoundError,
} from "../../../utils/errors";
import { createRandomRecipe } from "../../../utils/tests/recipes";
import { createUserToDatabaseAndAuthenticate } from "../../../utils/tests/testUtils";
import { postLikeHandler } from "./postLikeHandler";
import { RecipeVisibility } from "@prisma/client";

const getLikeCountForRecipe = async (id: string) => {
  const recipe = await getSingleRecipeWithoutCoverImageUrl(id);
  if (!recipe) {
    throw new Error("Recipe not found");
  }
  return recipe._count.likes;
};

describe("postLikeHandler", () => {
  test("can like recipe", async () => {
    const user = await createUserToDatabaseAndAuthenticate();

    const recipeAuthor = await createUserToDatabaseAndAuthenticate();
    const recipe = await createRecipe(
      recipeAuthor.userId,
      createRandomRecipe({
        visibility: RecipeVisibility.PUBLIC,
      }),
      null,
    );

    await postLikeHandler.handler(user, { id: recipe.id });

    const likes = await getLikeCountForRecipe(recipe.id);
    expect(likes).toBe(1);
  });

  test("can not like recipe twice", async () => {
    const user = await createUserToDatabaseAndAuthenticate();

    const recipeAuthor = await createUserToDatabaseAndAuthenticate();
    const recipe = await createRecipe(
      recipeAuthor.userId,
      createRandomRecipe({
        visibility: RecipeVisibility.PUBLIC,
      }),
      null,
    );

    await postLikeHandler.handler(user, { id: recipe.id });
    await expect(
      postLikeHandler.handler(user, { id: recipe.id }),
    ).rejects.toThrow(new RecipeAlreadyLikedError(recipe.id));

    const likes = await getLikeCountForRecipe(recipe.id);
    expect(likes).toBe(1);
  });

  test("can not like own recipe", async () => {
    const user = await createUserToDatabaseAndAuthenticate();

    const recipe = await createRecipe(
      user.userId,
      createRandomRecipe({
        visibility: RecipeVisibility.PUBLIC,
      }),
      null,
    );

    await expect(
      postLikeHandler.handler(user, { id: recipe.id }),
    ).rejects.toThrow(CannotLikeOwnRecipeError);

    const likes = await getLikeCountForRecipe(recipe.id);
    expect(likes).toBe(0);
  });

  test("can not like private recipe", async () => {
    const user = await createUserToDatabaseAndAuthenticate();

    const recipeAuthor = await createUserToDatabaseAndAuthenticate();
    const recipe = await createRecipe(
      recipeAuthor.userId,
      createRandomRecipe({
        visibility: RecipeVisibility.PRIVATE,
      }),
      null,
    );

    await expect(
      postLikeHandler.handler(user, { id: recipe.id }),
    ).rejects.toThrow(new RecipeNotFoundError(recipe.id));

    const likes = await getLikeCountForRecipe(recipe.id);
    expect(likes).toBe(0);
  });

  test("can not like recipe that does not exist", async () => {
    const user = await createUserToDatabaseAndAuthenticate();

    await expect(
      postLikeHandler.handler(user, { id: "does-not-exist" }),
    ).rejects.toThrow(new RecipeNotFoundError("does-not-exist"));
  });

  test("can like unlisted recipe", async () => {
    const user = await createUserToDatabaseAndAuthenticate();

    const recipeAuthor = await createUserToDatabaseAndAuthenticate();
    const recipe = await createRecipe(
      recipeAuthor.userId,
      createRandomRecipe({
        visibility: RecipeVisibility.UNLISTED,
      }),
      null,
    );

    await postLikeHandler.handler(user, { id: recipe.id });

    const likes = await getLikeCountForRecipe(recipe.id);
    expect(likes).toBe(1);
  });

  test("can not like own unlisted recipe", async () => {
    const user = await createUserToDatabaseAndAuthenticate();

    const recipe = await createRecipe(
      user.userId,
      createRandomRecipe({
        visibility: RecipeVisibility.UNLISTED,
      }),
      null,
    );

    await expect(
      postLikeHandler.handler(user, { id: recipe.id }),
    ).rejects.toThrow(CannotLikeOwnRecipeError);

    const likes = await getLikeCountForRecipe(recipe.id);
    expect(likes).toBe(0);
  });
});
