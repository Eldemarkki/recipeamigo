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

  it("should return array with 2 elements when user has 2 recipes", async () => {
    const userId = await createUserToDatabase();
    await createRecipe(userId, createRandomRecipe());
    await createRecipe(userId, createRandomRecipe());
    const recipes = await getAllRecipesForUser(userId);
    expect(recipes).toHaveLength(2);
  });

  it("shouldn't return other users' recipes", async () => {
    const userId1 = await createUserToDatabase();
    const userId2 = await createUserToDatabase();
    const newRecipe1 = await createRecipe(userId1, createRandomRecipe());
    const newRecipe2 = await createRecipe(userId2, createRandomRecipe());
    const recipes1 = await getAllRecipesForUser(userId1);
    const recipes2 = await getAllRecipesForUser(userId2);
    expect(recipes1).toHaveLength(1);
    expect(recipes2).toHaveLength(1);
    expect(recipes1[0]).toEqual(newRecipe1);
    expect(recipes2[0]).toEqual(newRecipe2);
  });
});
