import { createRecipe } from "../../database/recipes";
import { RecipeNotFoundError } from "../../utils/errors";
import { createRandomRecipe } from "../../utils/tests/recipes";
import { createUserToDatabaseAndAuthenticate } from "../../utils/tests/testUtils";
import { editRecipePageDataLoader } from "./editRecipePageDataLoader";
import { RecipeVisibility } from "@prisma/client";

describe("editRecipePageDataLoader", () => {
  test.each([
    RecipeVisibility.PUBLIC,
    RecipeVisibility.UNLISTED,
    RecipeVisibility.PRIVATE,
  ])("loads data for own %s recipe", async (visibility) => {
    const user = await createUserToDatabaseAndAuthenticate();
    const recipe = await createRecipe(
      user.userId,
      createRandomRecipe({
        visibility,
      }),
      null,
    );

    const data = await editRecipePageDataLoader.handler(user, {
      id: recipe.id,
    });

    expect(data.recipe.name).toEqual(recipe.name);
  });

  test.each([
    RecipeVisibility.PUBLIC,
    RecipeVisibility.UNLISTED,
    RecipeVisibility.PRIVATE,
  ])("doesn't load data for other user's %s recipe", async (visibility) => {
    const victim = await createUserToDatabaseAndAuthenticate();
    const recipe = await createRecipe(
      victim.userId,
      createRandomRecipe({
        visibility,
      }),
      null,
    );

    const user = await createUserToDatabaseAndAuthenticate();

    await expect(
      editRecipePageDataLoader.handler(user, {
        id: recipe.id,
      }),
    ).rejects.toThrowError(new RecipeNotFoundError(recipe.id));
  });

  test("doesn't load data for non-existent recipe", async () => {
    const user = await createUserToDatabaseAndAuthenticate();

    await expect(
      editRecipePageDataLoader.handler(user, {
        id: "non-existent",
      }),
    ).rejects.toThrowError(new RecipeNotFoundError("non-existent"));
  });
});
