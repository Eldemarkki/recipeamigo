import { createRecipe, getAllRecipesForUser } from "./recipes";
import { createUserToDatabase } from "../utils/tests/testUtils";
import { createRandomRecipe } from "../utils/tests/recipes";

describe("recipes", () => {
  it("should return empty array when user has no recipes", async () => {
    const userId = await createUserToDatabase();
    const recipes = await getAllRecipesForUser(userId);
    expect(recipes).toHaveLength(0);
  });

  it("should return array with 1 element when user has 1 recipe", async () => {
    const userId = await createUserToDatabase();
    const newRecipe = await createRecipe(userId, createRandomRecipe());
    const recipes = await getAllRecipesForUser(userId);
    expect(recipes).toHaveLength(1);
    expect(recipes[0]).toEqual(newRecipe);
  });
});
