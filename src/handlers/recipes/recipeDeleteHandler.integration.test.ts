import { createRecipe, getSingleRecipe } from "../../database/recipes";
import { RecipeNotFoundError } from "../../utils/errors";
import { createRandomRecipe } from "../../utils/tests/recipes";
import { createUserToDatabaseAndAuthenticate } from "../../utils/tests/testUtils";
import { recipesDeleteHandler } from "./recipeDeleteHandler";

describe("recipeDeleteHandler", () => {
  test("can delete own recipe", async () => {
    const user = await createUserToDatabaseAndAuthenticate();

    const recipe = await createRecipe(user.userId, createRandomRecipe(), null);

    await recipesDeleteHandler.handler(user, {
      id: recipe.id,
    });

    const editedRecipe = await getSingleRecipe(recipe.id);
    expect(editedRecipe).toBeNull();
  });

  test("cannot delete non-existent recipe", async () => {
    const user = await createUserToDatabaseAndAuthenticate();

    await expect(
      recipesDeleteHandler.handler(user, {
        id: "non-existent",
      }),
    ).rejects.toThrowError(new RecipeNotFoundError("non-existent"));
  });

  test("cannot delete other people's recipe", async () => {
    const author = await createUserToDatabaseAndAuthenticate();
    const recipe = await createRecipe(
      author.userId,
      createRandomRecipe(),
      null,
    );

    const user = await createUserToDatabaseAndAuthenticate();

    await expect(
      recipesDeleteHandler.handler(user, {
        id: recipe.id,
      }),
    ).rejects.toThrowError(new RecipeNotFoundError(recipe.id));
  });
});
