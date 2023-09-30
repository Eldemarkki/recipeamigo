import { createRecipe } from "../../database/recipes";
import { createRandomRecipe } from "../../utils/tests/recipes";
import { createUserToDatabaseAndAuthenticate } from "../../utils/tests/testUtils";
import { newCollectionPageDataLoader } from "./newCollectionPageDataLoader";
import { RecipeVisibility } from "@prisma/client";

describe("newCollectionPageDataLoader", () => {
  test("loads all recipes for user", async () => {
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

    const data = await newCollectionPageDataLoader.handler(user);

    expect(data.allRecipes).toHaveLength(3);
    expect(data.allRecipes[0].id).toBe(recipes[0].id);
    expect(data.allRecipes[1].id).toBe(recipes[1].id);
    expect(data.allRecipes[2].id).toBe(recipes[2].id);
  });
});
