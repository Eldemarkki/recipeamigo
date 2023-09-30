import {
  createRecipe,
  getSingleRecipeWithoutCoverImageUrl,
} from "../../../database/recipes";
import {
  CannotUnlikeOwnRecipeError,
  RecipeAlreadyUnlikedError,
  RecipeNotFoundError,
} from "../../../utils/errors";
import { createRandomRecipe } from "../../../utils/tests/recipes";
import { createUserToDatabaseAndAuthenticate } from "../../../utils/tests/testUtils";
import { postLikeHandler } from "./postLikeHandler";
import { postUnlikeHandler } from "./postUnlikeHandler";
import { RecipeVisibility } from "@prisma/client";

const getLikeCountForRecipe = async (id: string) => {
  const recipe = await getSingleRecipeWithoutCoverImageUrl(id);
  if (!recipe) {
    throw new Error("Recipe not found");
  }
  return recipe._count.likes;
};

describe("postUnlikeHandler", () => {
  test("can't unlike an unliked recipe", async () => {
    const user = await createUserToDatabaseAndAuthenticate();

    const recipeAuthor = await createUserToDatabaseAndAuthenticate();
    const recipe = await createRecipe(
      recipeAuthor.userId,
      createRandomRecipe({
        visibility: RecipeVisibility.PUBLIC,
      }),
      null,
    );

    await expect(
      postUnlikeHandler.handler(user, { id: recipe.id }),
    ).rejects.toThrow(new RecipeAlreadyUnlikedError(recipe.id));

    const likes = await getLikeCountForRecipe(recipe.id);
    expect(likes).toBe(0);
  });

  test("can not unlike recipe twice", async () => {
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

    await postUnlikeHandler.handler(user, { id: recipe.id });
    await expect(
      postUnlikeHandler.handler(user, { id: recipe.id }),
    ).rejects.toThrow(new RecipeAlreadyUnlikedError(recipe.id));

    const likesAfterUnlike = await getLikeCountForRecipe(recipe.id);
    expect(likesAfterUnlike).toBe(0);
  });

  test("can not unlike own recipe", async () => {
    const user = await createUserToDatabaseAndAuthenticate();

    const recipe = await createRecipe(
      user.userId,
      createRandomRecipe({
        visibility: RecipeVisibility.PUBLIC,
      }),
      null,
    );

    await expect(
      postUnlikeHandler.handler(user, { id: recipe.id }),
    ).rejects.toThrow(CannotUnlikeOwnRecipeError);

    const likes = await getLikeCountForRecipe(recipe.id);
    expect(likes).toBe(0);
  });

  test("can not unlike private recipe", async () => {
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
      postUnlikeHandler.handler(user, { id: recipe.id }),
    ).rejects.toThrow(new RecipeNotFoundError(recipe.id));

    const likes = await getLikeCountForRecipe(recipe.id);
    expect(likes).toBe(0);
  });

  test("can not unlike recipe that does not exist", async () => {
    const user = await createUserToDatabaseAndAuthenticate();

    await expect(
      postUnlikeHandler.handler(user, { id: "123" }),
    ).rejects.toThrow(new RecipeNotFoundError("123"));
  });

  test("can unlike unlisted recipe", async () => {
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

    await postUnlikeHandler.handler(user, { id: recipe.id });
    const likesAfterUnlike = await getLikeCountForRecipe(recipe.id);
    expect(likesAfterUnlike).toBe(0);
  });

  test("can not unlike own unlisted recipe", async () => {
    const user = await createUserToDatabaseAndAuthenticate();

    const recipe = await createRecipe(
      user.userId,
      createRandomRecipe({
        visibility: RecipeVisibility.UNLISTED,
      }),
      null,
    );

    await expect(
      postUnlikeHandler.handler(user, { id: recipe.id }),
    ).rejects.toThrow(CannotUnlikeOwnRecipeError);

    const likes = await getLikeCountForRecipe(recipe.id);
    expect(likes).toBe(0);
  });
});
