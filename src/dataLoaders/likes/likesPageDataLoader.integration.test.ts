import { createRecipe } from "../../database/recipes";
import { postLikeHandler } from "../../handlers/recipes/likes/postLikeHandler";
import { createRandomRecipe } from "../../utils/tests/recipes";
import { createUserToDatabaseAndAuthenticate } from "../../utils/tests/testUtils";
import { likesPageDataLoader } from "./likesPageDataLoader";
import { RecipeVisibility } from "@prisma/client";

describe("likesPageDataLoader", () => {
  it("should return liked recipes", async () => {
    const user = await createUserToDatabaseAndAuthenticate();

    const user2 = await createUserToDatabaseAndAuthenticate();
    await createRecipe(
      user2.userId,
      createRandomRecipe({ visibility: RecipeVisibility.PUBLIC }),
      null,
    );
    const recipe2 = await createRecipe(
      user2.userId,
      createRandomRecipe({ visibility: RecipeVisibility.PUBLIC }),
      null,
    );

    await postLikeHandler.handler(user, {
      id: recipe2.id,
    });

    const response = await likesPageDataLoader.handler(user);

    expect(response.likedRecipes).toHaveLength(1);
    expect(response.likedRecipes[0].id).toEqual(recipe2.id);
  });
});
