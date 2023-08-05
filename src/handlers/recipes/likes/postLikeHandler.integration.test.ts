import { getLikeCountForRecipe } from "../../../database/likes";
import { createRecipe } from "../../../database/recipes";
import { CannotLikeOwnRecipe, RecipeAlreadyLiked } from "../../../utils/errors";
import { createRandomRecipe } from "../../../utils/tests/recipes";
import { createUserToDatabaseAndAuthenticate } from "../../../utils/tests/testUtils";
import { postLikeHandler } from "./postLikeHandler";
import { RecipeVisibility } from "@prisma/client";

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

    await postLikeHandler.handler(user, {}, { id: recipe.id });

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

    await postLikeHandler.handler(user, {}, { id: recipe.id });
    await expect(
      postLikeHandler.handler(user, {}, { id: recipe.id }),
    ).rejects.toThrow(new RecipeAlreadyLiked(recipe.id));

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
      postLikeHandler.handler(user, {}, { id: recipe.id }),
    ).rejects.toThrow(CannotLikeOwnRecipe);

    const likes = await getLikeCountForRecipe(recipe.id);
    expect(likes).toBe(0);
  });
});
