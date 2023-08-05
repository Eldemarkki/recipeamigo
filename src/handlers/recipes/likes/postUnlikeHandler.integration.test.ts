import { getLikeCountForRecipe } from "../../../database/likes";
import { createRecipe } from "../../../database/recipes";
import {
  CannotUnlikeOwnRecipe,
  RecipeAlreadyUnliked,
} from "../../../utils/errors";
import { createRandomRecipe } from "../../../utils/tests/recipes";
import { createUserToDatabaseAndAuthenticate } from "../../../utils/tests/testUtils";
import { postLikeHandler } from "./postLikeHandler";
import { postUnlikeHandler } from "./postUnlikeHandler";
import { RecipeVisibility } from "@prisma/client";

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
      postUnlikeHandler.handler(user, {}, { id: recipe.id }),
    ).rejects.toThrow(new RecipeAlreadyUnliked(recipe.id));

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

    await postLikeHandler.handler(user, {}, { id: recipe.id });
    const likes = await getLikeCountForRecipe(recipe.id);
    expect(likes).toBe(1);

    await postUnlikeHandler.handler(user, {}, { id: recipe.id });
    await expect(
      postUnlikeHandler.handler(user, {}, { id: recipe.id }),
    ).rejects.toThrow(new RecipeAlreadyUnliked(recipe.id));

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
      postUnlikeHandler.handler(user, {}, { id: recipe.id }),
    ).rejects.toThrow(CannotUnlikeOwnRecipe);

    const likes = await getLikeCountForRecipe(recipe.id);
    expect(likes).toBe(0);
  });
});