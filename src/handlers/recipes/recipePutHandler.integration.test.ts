import { createRecipe, getSingleRecipe } from "../../database/recipes";
import { RecipeNotFoundError } from "../../utils/errors";
import { createRandomRecipe } from "../../utils/tests/recipes";
import { createUserToDatabaseAndAuthenticate } from "../../utils/tests/testUtils";
import { recipesPutHandler } from "./recipePutHandler";
import { RecipeVisibility } from "@prisma/client";

// Recipe property editing is also tested in src/database/recipes.integration.test.ts

describe("recipePutHandler", () => {
  test("can edit own recipe", async () => {
    const user = await createUserToDatabaseAndAuthenticate();

    const recipe = await createRecipe(
      user.userId,
      createRandomRecipe({ name: "My recipe" }),
      null,
    );

    await recipesPutHandler.handler(
      user,
      {
        name: "Edited recipe name",
        coverImageAction: "keep",
      },
      {
        id: recipe.id,
      },
    );

    const editedRecipe = await getSingleRecipe(recipe.id);
    expect(editedRecipe).not.toBeNull();
    if (editedRecipe) {
      expect(editedRecipe.name).toBe("Edited recipe name");
    }
  });

  test.each([
    RecipeVisibility.PRIVATE,
    RecipeVisibility.UNLISTED,
    RecipeVisibility.PUBLIC,
  ])("cannot edit other people's %s recipe", async (recipeVisibility) => {
    const author = await createUserToDatabaseAndAuthenticate();
    const recipe = await createRecipe(
      author.userId,
      createRandomRecipe({ name: "My recipe", visibility: recipeVisibility }),
      null,
    );

    const user = await createUserToDatabaseAndAuthenticate();

    await expect(
      recipesPutHandler.handler(
        user,
        {
          name: "Edited recipe name",
          coverImageAction: "keep",
        },
        {
          id: recipe.id,
        },
      ),
    ).rejects.toThrowError(new RecipeNotFoundError(recipe.id));
  });

  test("cannot edit recipe that does not exist", async () => {
    const user = await createUserToDatabaseAndAuthenticate();

    await expect(
      recipesPutHandler.handler(
        user,
        {
          name: "Edited recipe name",
          coverImageAction: "keep",
        },
        {
          id: "123",
        },
      ),
    ).rejects.toThrowError(new RecipeNotFoundError("123"));
  });
});
