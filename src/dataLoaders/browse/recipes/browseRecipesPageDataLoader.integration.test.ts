import config from "../../../config";
import { createRecipe, editRecipe } from "../../../database/recipes";
import { prisma, resetDatabase } from "../../../db";
import { postLikeHandler } from "../../../handlers/recipes/likes/postLikeHandler";
import { createRandomRecipe } from "../../../utils/tests/recipes";
import { createUserToDatabaseAndAuthenticate } from "../../../utils/tests/testUtils";
import { browseRecipesPageDataLoader } from "./browseRecipesPageDataLoader";
import { RecipeVisibility } from "@prisma/client";

describe("browseRecipesPageDataLoader", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  test("only loads public recipes", async () => {
    const user = await createUserToDatabaseAndAuthenticate();
    const user2 = await createUserToDatabaseAndAuthenticate();

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

    const recipes2 = await Promise.all(
      [
        RecipeVisibility.PUBLIC,
        RecipeVisibility.UNLISTED,
        RecipeVisibility.PRIVATE,
      ].map((visibility) =>
        createRecipe(
          user2.userId,
          createRandomRecipe({
            visibility,
          }),
          null,
        ),
      ),
    );

    const data = await browseRecipesPageDataLoader.handler(user, {});

    expect(data.recipes).toHaveLength(2);
    expect(data.recipes.map((x) => x.id)).toContain(recipes[0].id);
    expect(data.recipes.map((x) => x.id)).toContain(recipes2[0].id);
  });

  test("can use pagination", async () => {
    const user = await createUserToDatabaseAndAuthenticate();

    for (let i = 0; i < 50; i++) {
      await createRecipe(
        user.userId,
        createRandomRecipe({
          name: `Recipe ${i}`,
          visibility: RecipeVisibility.PUBLIC,
        }),
        null,
      );
    }

    const data = await browseRecipesPageDataLoader.handler(user, {
      page: "2",
      pageSize: "10",
    });

    expect(data.recipes).toHaveLength(10);
    expect(data.recipes[0].name).toBe("Recipe 39");
    expect(data.recipes[9].name).toBe("Recipe 30");
  });

  test("doesn't load more than pagination page size", async () => {
    const user = await createUserToDatabaseAndAuthenticate();

    for (let i = 0; i < config.RECIPE_PAGINATION_DEFAULT_PAGE_SIZE * 2; i++) {
      await createRecipe(
        user.userId,
        createRandomRecipe({
          name: `Recipe ${i}`,
          visibility: RecipeVisibility.PUBLIC,
        }),
        null,
      );
    }

    const data = await browseRecipesPageDataLoader.handler(user, {});

    expect(data.recipes).toHaveLength(
      config.RECIPE_PAGINATION_DEFAULT_PAGE_SIZE,
    );
  });

  test("can use search on title", async () => {
    const user = await createUserToDatabaseAndAuthenticate();

    await createRecipe(
      user.userId,
      createRandomRecipe({
        name: "my favorite recipe",
        visibility: RecipeVisibility.PUBLIC,
      }),
      null,
    );

    await createRecipe(
      user.userId,
      createRandomRecipe({
        name: "i hate this recipe",
        visibility: RecipeVisibility.PUBLIC,
      }),
      null,
    );

    const data = await browseRecipesPageDataLoader.handler(user, {
      search: "favorite",
    });

    expect(data.recipes).toHaveLength(1);
    expect(data.recipes[0].name).toBe("my favorite recipe");
  });

  test("can use search on description", async () => {
    const user = await createUserToDatabaseAndAuthenticate();

    await createRecipe(
      user.userId,
      createRandomRecipe({
        description: "my favorite recipe",
        visibility: RecipeVisibility.PUBLIC,
      }),
      null,
    );

    await createRecipe(
      user.userId,
      createRandomRecipe({
        description: "i hate this recipe",
        visibility: RecipeVisibility.PUBLIC,
      }),
      null,
    );

    const data = await browseRecipesPageDataLoader.handler(user, {
      search: "favorite",
    });

    expect(data.recipes).toHaveLength(1);
    expect(data.recipes[0].description).toBe("my favorite recipe");
  });

  test("can use search on tags", async () => {
    const user = await createUserToDatabaseAndAuthenticate();

    await createRecipe(
      user.userId,
      createRandomRecipe({
        name: "this should be found",
        tags: ["favorite"],
        visibility: RecipeVisibility.PUBLIC,
      }),
      null,
    );

    await createRecipe(
      user.userId,
      createRandomRecipe({
        tags: ["hate"],
        visibility: RecipeVisibility.PUBLIC,
      }),
      null,
    );

    const data = await browseRecipesPageDataLoader.handler(user, {
      search: "favorite",
    });

    expect(data.recipes).toHaveLength(1);
    expect(data.recipes[0].name).toBe("this should be found");
  });

  test("can use search on title with insensitive case", async () => {
    const user = await createUserToDatabaseAndAuthenticate();

    await createRecipe(
      user.userId,
      createRandomRecipe({
        name: "my favorite recipe",
        visibility: RecipeVisibility.PUBLIC,
      }),
      null,
    );

    await createRecipe(
      user.userId,
      createRandomRecipe({
        name: "i hate this recipe",
        visibility: RecipeVisibility.PUBLIC,
      }),
      null,
    );

    const data = await browseRecipesPageDataLoader.handler(user, {
      search: "FAVORITE",
    });

    expect(data.recipes).toHaveLength(1);
    expect(data.recipes[0].name).toBe("my favorite recipe");
  });

  test("can use search on description with insensitive case", async () => {
    const user = await createUserToDatabaseAndAuthenticate();

    await createRecipe(
      user.userId,
      createRandomRecipe({
        description: "my favorite recipe",
        visibility: RecipeVisibility.PUBLIC,
      }),
      null,
    );

    await createRecipe(
      user.userId,
      createRandomRecipe({
        description: "i hate this recipe",
        visibility: RecipeVisibility.PUBLIC,
      }),
      null,
    );

    const data = await browseRecipesPageDataLoader.handler(user, {
      search: "FAVORITE",
    });

    expect(data.recipes).toHaveLength(1);
    expect(data.recipes[0].description).toBe("my favorite recipe");
  });

  test("can use search on tags with insensitive case", async () => {
    const user = await createUserToDatabaseAndAuthenticate();

    await createRecipe(
      user.userId,
      createRandomRecipe({
        name: "this should be found",
        tags: ["favorite"],
        visibility: RecipeVisibility.PUBLIC,
      }),
      null,
    );

    await createRecipe(
      user.userId,
      createRandomRecipe({
        tags: ["hate"],
        visibility: RecipeVisibility.PUBLIC,
      }),
      null,
    );

    const data = await browseRecipesPageDataLoader.handler(user, {
      search: "FAVORITE",
    });

    expect(data.recipes).toHaveLength(1);
    expect(data.recipes[0].name).toBe("this should be found");
  });

  test("can exclude recipes with specific ingredients", async () => {
    const user = await createUserToDatabaseAndAuthenticate();

    await createRecipe(
      user.userId,
      createRandomRecipe({
        name: "this should be found",
        ingredientSections: [
          {
            name: "ingredients",
            ingredients: [
              {
                name: "tomato",
                quantity: 1,
                unit: "CUP",
              },
              {
                name: "cucumber",
                quantity: 1,
              },
            ],
          },
        ],
        visibility: RecipeVisibility.PUBLIC,
      }),
      null,
    );

    await createRecipe(
      user.userId,
      createRandomRecipe({
        name: "this should not be found",
        ingredientSections: [
          {
            name: "ingredients",
            ingredients: [
              {
                name: "fish",
                quantity: 1,
                unit: "CUP",
              },
            ],
          },
        ],
        visibility: RecipeVisibility.PUBLIC,
      }),
      null,
    );

    await createRecipe(
      user.userId,
      createRandomRecipe({
        name: "this should not be found neither",
        ingredientSections: [
          {
            name: "ingredients",
            ingredients: [
              {
                name: "potato",
                quantity: 1,
              },
            ],
          },
        ],
        visibility: RecipeVisibility.PUBLIC,
      }),
      null,
    );

    const data = await browseRecipesPageDataLoader.handler(user, {
      excludedIngredients: ["fish", "potato"],
    });

    expect(data.recipes).toHaveLength(1);
    expect(data.recipes[0].name).toBe("this should be found");
  });

  test("can exclude recipes with specific ingredients with insensitive case", async () => {
    const user = await createUserToDatabaseAndAuthenticate();

    await createRecipe(
      user.userId,
      createRandomRecipe({
        name: "this should be found",
        ingredientSections: [
          {
            name: "ingredients",
            ingredients: [
              {
                name: "tomato",
                quantity: 1,
                unit: "CUP",
              },
              {
                name: "cucumber",
                quantity: 1,
              },
            ],
          },
        ],
        visibility: RecipeVisibility.PUBLIC,
      }),
      null,
    );

    await createRecipe(
      user.userId,
      createRandomRecipe({
        name: "this should not be found",
        ingredientSections: [
          {
            name: "ingredients",
            ingredients: [
              {
                name: "fish",
                quantity: 1,
                unit: "CUP",
              },
            ],
          },
        ],
        visibility: RecipeVisibility.PUBLIC,
      }),
      null,
    );

    await createRecipe(
      user.userId,
      createRandomRecipe({
        name: "this should not be found neither",
        ingredientSections: [
          {
            name: "ingredients",
            ingredients: [
              {
                name: "POtaTO",
                quantity: 1,
              },
            ],
          },
        ],
        visibility: RecipeVisibility.PUBLIC,
      }),
      null,
    );

    const data = await browseRecipesPageDataLoader.handler(user, {
      excludedIngredients: ["FISH", "pOtAtO"],
    });

    expect(data.recipes).toHaveLength(1);
    expect(data.recipes[0].name).toBe("this should be found");
  });

  test("can filter by tags", async () => {
    const user = await createUserToDatabaseAndAuthenticate();

    await createRecipe(
      user.userId,
      createRandomRecipe({
        name: "this should be found",
        tags: ["favorite"],
        visibility: RecipeVisibility.PUBLIC,
      }),
      null,
    );

    await createRecipe(
      user.userId,
      createRandomRecipe({
        tags: ["hate"],
        visibility: RecipeVisibility.PUBLIC,
      }),
      null,
    );

    const data = await browseRecipesPageDataLoader.handler(user, {
      tags: ["favorite"],
    });

    expect(data.recipes).toHaveLength(1);
    expect(data.recipes[0].name).toBe("this should be found");
  });

  test("can filter by tags with insensitive case", async () => {
    const user = await createUserToDatabaseAndAuthenticate();

    await createRecipe(
      user.userId,
      createRandomRecipe({
        name: "this should be found",
        tags: ["favorite"],
        visibility: RecipeVisibility.PUBLIC,
      }),
      null,
    );

    await createRecipe(
      user.userId,
      createRandomRecipe({
        tags: ["hate"],
        visibility: RecipeVisibility.PUBLIC,
      }),
      null,
    );

    const data = await browseRecipesPageDataLoader.handler(user, {
      tags: ["FAVORITE"],
    });

    expect(data.recipes).toHaveLength(1);
    expect(data.recipes[0].name).toBe("this should be found");
  });

  test("can filter by maximum time", async () => {
    const user = await createUserToDatabaseAndAuthenticate();

    await createRecipe(
      user.userId,
      createRandomRecipe({
        name: "this should be found 111",
        timeEstimateMaximumMinutes: 10,
        timeEstimateMinimumMinutes: 5,
        visibility: RecipeVisibility.PUBLIC,
      }),
      null,
    );

    await createRecipe(
      user.userId,
      createRandomRecipe({
        timeEstimateMaximumMinutes: 20,
        timeEstimateMinimumMinutes: 15,
        visibility: RecipeVisibility.PUBLIC,
      }),
      null,
    );

    await createRecipe(
      user.userId,
      createRandomRecipe({
        name: "this should be found 22222",
        timeEstimateMinimumMinutes: 5,
        timeEstimateMaximumMinutes: undefined,
        visibility: RecipeVisibility.PUBLIC,
      }),
      null,
    );

    const data = await browseRecipesPageDataLoader.handler(user, {
      maximumTime: "10",
    });

    expect(data.recipes).toHaveLength(2);
    expect(data.recipes[0].name).toBe("this should be found 22222");
    expect(data.recipes[1].name).toBe("this should be found 111");
  });

  test("can sort by name ascending", async () => {
    const user = await createUserToDatabaseAndAuthenticate();

    await createRecipe(
      user.userId,
      createRandomRecipe({
        name: "a",
        visibility: RecipeVisibility.PUBLIC,
      }),
      null,
    );

    await createRecipe(
      user.userId,
      createRandomRecipe({
        name: "b",
        visibility: RecipeVisibility.PUBLIC,
      }),
      null,
    );

    const data = await browseRecipesPageDataLoader.handler(user, {
      sort: "name.asc",
    });

    expect(data.recipes).toHaveLength(2);
    expect(data.recipes[0].name).toBe("a");
    expect(data.recipes[1].name).toBe("b");
  });

  test("can sort by name descending", async () => {
    const user = await createUserToDatabaseAndAuthenticate();

    await createRecipe(
      user.userId,
      createRandomRecipe({
        name: "a",
        visibility: RecipeVisibility.PUBLIC,
      }),
      null,
    );

    await createRecipe(
      user.userId,
      createRandomRecipe({
        name: "b",
        visibility: RecipeVisibility.PUBLIC,
      }),
      null,
    );

    const data = await browseRecipesPageDataLoader.handler(user, {
      sort: "name.desc",
    });

    expect(data.recipes).toHaveLength(2);
    expect(data.recipes[0].name).toBe("b");
    expect(data.recipes[1].name).toBe("a");
  });

  test("can sort by likes ascending", async () => {
    const user = await createUserToDatabaseAndAuthenticate();
    const user2 = await createUserToDatabaseAndAuthenticate();

    const recipe1 = await createRecipe(
      user.userId,
      createRandomRecipe({
        name: "first",
        visibility: RecipeVisibility.PUBLIC,
      }),
      null,
    );

    const recipe2 = await createRecipe(
      user.userId,
      createRandomRecipe({
        name: "second",
        visibility: RecipeVisibility.PUBLIC,
      }),
      null,
    );

    await postLikeHandler.handler(user2, { id: recipe1.id });

    const data = await browseRecipesPageDataLoader.handler(user, {
      sort: "likes.asc",
    });

    expect(data.recipes).toHaveLength(2);
    expect(data.recipes[0].id).toBe(recipe2.id);
    expect(data.recipes[1].id).toBe(recipe1.id);
  });

  test("can sort by likes descending", async () => {
    const user = await createUserToDatabaseAndAuthenticate();
    const user2 = await createUserToDatabaseAndAuthenticate();

    const recipe1 = await createRecipe(
      user.userId,
      createRandomRecipe({
        visibility: RecipeVisibility.PUBLIC,
      }),
      null,
    );

    const recipe2 = await createRecipe(
      user.userId,
      createRandomRecipe({
        visibility: RecipeVisibility.PUBLIC,
      }),
      null,
    );

    await postLikeHandler.handler(user2, { id: recipe1.id });

    const data = await browseRecipesPageDataLoader.handler(user, {
      sort: "likes.desc",
    });

    expect(data.recipes).toHaveLength(2);
    expect(data.recipes[0].id).toBe(recipe1.id);
    expect(data.recipes[1].id).toBe(recipe2.id);
  });

  test("can sort by views ascending", async () => {
    const user = await createUserToDatabaseAndAuthenticate();

    const recipe1 = await createRecipe(
      user.userId,
      createRandomRecipe({
        visibility: RecipeVisibility.PUBLIC,
      }),
      null,
    );

    await prisma.recipe.update({
      where: {
        id: recipe1.id,
      },
      data: {
        viewCount: 10,
      },
    });

    const recipe2 = await createRecipe(
      user.userId,
      createRandomRecipe({
        visibility: RecipeVisibility.PUBLIC,
      }),
      null,
    );

    const data = await browseRecipesPageDataLoader.handler(user, {
      sort: "views.asc",
    });

    expect(data.recipes).toHaveLength(2);
    expect(data.recipes[0].id).toBe(recipe2.id);
    expect(data.recipes[1].id).toBe(recipe1.id);
  });

  test("can sort by views descending", async () => {
    const user = await createUserToDatabaseAndAuthenticate();

    const recipe1 = await createRecipe(
      user.userId,
      createRandomRecipe({
        visibility: RecipeVisibility.PUBLIC,
      }),
      null,
    );

    await prisma.recipe.update({
      where: {
        id: recipe1.id,
      },
      data: {
        viewCount: 10,
      },
    });

    const recipe2 = await createRecipe(
      user.userId,
      createRandomRecipe({
        visibility: RecipeVisibility.PUBLIC,
      }),
      null,
    );

    const data = await browseRecipesPageDataLoader.handler(user, {
      sort: "views.desc",
    });

    expect(data.recipes).toHaveLength(2);
    expect(data.recipes[0].id).toBe(recipe1.id);
    expect(data.recipes[1].id).toBe(recipe2.id);
  });

  test("can sort by creation date ascending", async () => {
    const user = await createUserToDatabaseAndAuthenticate();

    const recipe1 = await createRecipe(
      user.userId,
      createRandomRecipe({
        visibility: RecipeVisibility.PUBLIC,
      }),
      null,
    );

    const recipe2 = await createRecipe(
      user.userId,
      createRandomRecipe({
        visibility: RecipeVisibility.PUBLIC,
      }),
      null,
    );

    const data = await browseRecipesPageDataLoader.handler(user, {
      sort: "createdAt.asc",
    });

    expect(data.recipes).toHaveLength(2);
    expect(data.recipes[0].id).toBe(recipe1.id);
    expect(data.recipes[1].id).toBe(recipe2.id);
  });

  test("can sort by creation date descending", async () => {
    const user = await createUserToDatabaseAndAuthenticate();

    const recipe1 = await createRecipe(
      user.userId,
      createRandomRecipe({
        visibility: RecipeVisibility.PUBLIC,
      }),
      null,
    );

    const recipe2 = await createRecipe(
      user.userId,
      createRandomRecipe({
        visibility: RecipeVisibility.PUBLIC,
      }),
      null,
    );

    const data = await browseRecipesPageDataLoader.handler(user, {
      sort: "createdAt.desc",
    });

    expect(data.recipes).toHaveLength(2);
    expect(data.recipes[0].id).toBe(recipe2.id);
    expect(data.recipes[1].id).toBe(recipe1.id);
  });

  test("can sort by update date ascending", async () => {
    const user = await createUserToDatabaseAndAuthenticate();

    const recipe1 = await createRecipe(
      user.userId,
      createRandomRecipe({
        visibility: RecipeVisibility.PUBLIC,
      }),
      null,
    );

    await editRecipe(user.userId, recipe1.id, {
      name: "new name",
      coverImageAction: "keep",
    });

    const recipe2 = await createRecipe(
      user.userId,
      createRandomRecipe({
        visibility: RecipeVisibility.PUBLIC,
      }),
      null,
    );

    const data = await browseRecipesPageDataLoader.handler(user, {
      sort: "updatedAt.asc",
    });

    expect(data.recipes).toHaveLength(2);
    expect(data.recipes[0].id).toBe(recipe1.id);
    expect(data.recipes[1].id).toBe(recipe2.id);
  });

  test("can sort by update date descending", async () => {
    const user = await createUserToDatabaseAndAuthenticate();

    const recipe1 = await createRecipe(
      user.userId,
      createRandomRecipe({
        visibility: RecipeVisibility.PUBLIC,
      }),
      null,
    );

    await editRecipe(user.userId, recipe1.id, {
      name: "new name",
      coverImageAction: "keep",
    });

    const recipe2 = await createRecipe(
      user.userId,
      createRandomRecipe({
        visibility: RecipeVisibility.PUBLIC,
      }),
      null,
    );

    const data = await browseRecipesPageDataLoader.handler(user, {
      sort: "updatedAt.desc",
    });

    expect(data.recipes).toHaveLength(2);
    expect(data.recipes[0].id).toBe(recipe2.id);
    expect(data.recipes[1].id).toBe(recipe1.id);
  });
});
