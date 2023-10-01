import { createCollection, getCollection } from "../../database/collections";
import {
  createRecipe,
  getSingleRecipe,
  getSingleRecipeWithoutCoverImageUrl,
} from "../../database/recipes";
import {
  IngredientSectionsNotFoundError,
  IngredientsNotFoundError,
  InstructionsNotFoundError,
  RecipeNotFoundError,
} from "../../utils/errors";
import { createRandomRecipe } from "../../utils/tests/recipes";
import { createUserToDatabaseAndAuthenticate } from "../../utils/tests/testUtils";
import { postLikeHandler } from "./likes/postLikeHandler";
import { recipesPutHandler } from "./recipePutHandler";
import { RecipeCollectionVisibility, RecipeVisibility } from "@prisma/client";

// Recipe property editing is also tested in src/database/recipes.integration.test.ts

const getLikeCountForRecipe = async (id: string) => {
  const recipe = await getSingleRecipeWithoutCoverImageUrl(id);
  if (!recipe) {
    throw new Error("Recipe not found");
  }
  return recipe._count.likes;
};

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

  test("making public recipe unlisted should remove it from everyone's public collections", async () => {
    const author = await createUserToDatabaseAndAuthenticate();
    const recipe = await createRecipe(
      author.userId,
      createRandomRecipe({
        visibility: RecipeVisibility.PUBLIC,
      }),
      null,
    );

    const user = await createUserToDatabaseAndAuthenticate();
    const publicCollection = await createCollection(user.userId, {
      name: "My public collection",
      visibility: RecipeCollectionVisibility.PUBLIC,
      recipeIds: [recipe.id],
    });
    const unlistedCollection = await createCollection(user.userId, {
      name: "My unlisted collection",
      visibility: RecipeCollectionVisibility.UNLISTED,
      recipeIds: [recipe.id],
    });
    const privateCollection = await createCollection(user.userId, {
      name: "My private collection",
      visibility: RecipeCollectionVisibility.PRIVATE,
      recipeIds: [recipe.id],
    });

    expect(
      (await getCollection(publicCollection.id))?.RecipesOnCollections.map(
        (x) => x.recipeId,
      ),
    ).toEqual([recipe.id]);
    expect(
      (await getCollection(unlistedCollection.id))?.RecipesOnCollections.map(
        (x) => x.recipeId,
      ),
    ).toEqual([recipe.id]);
    expect(
      (await getCollection(privateCollection.id))?.RecipesOnCollections.map(
        (x) => x.recipeId,
      ),
    ).toEqual([recipe.id]);

    await recipesPutHandler.handler(
      author,
      {
        coverImageAction: "keep",
        visibility: RecipeVisibility.UNLISTED,
      },
      {
        id: recipe.id,
      },
    );

    const afterIds = (
      await getCollection(publicCollection.id)
    )?.RecipesOnCollections.map((x) => x.recipeId);
    expect(afterIds).toEqual([]);
    expect(
      (await getCollection(unlistedCollection.id))?.RecipesOnCollections.map(
        (x) => x.recipeId,
      ),
    ).toEqual([recipe.id]);
    expect(
      (await getCollection(privateCollection.id))?.RecipesOnCollections.map(
        (x) => x.recipeId,
      ),
    ).toEqual([recipe.id]);
  });

  test("making unlisted recipe private should remove it from everyone's unlisted and private collections", async () => {
    const author = await createUserToDatabaseAndAuthenticate();
    const recipe = await createRecipe(
      author.userId,
      createRandomRecipe({
        visibility: RecipeVisibility.UNLISTED,
      }),
      null,
    );

    const user = await createUserToDatabaseAndAuthenticate();
    const unlistedCollection = await createCollection(user.userId, {
      name: "My unlisted collection",
      visibility: RecipeCollectionVisibility.UNLISTED,
      recipeIds: [recipe.id],
    });
    const privateCollection = await createCollection(user.userId, {
      name: "My private collection",
      visibility: RecipeCollectionVisibility.PRIVATE,
      recipeIds: [recipe.id],
    });

    expect(
      (await getCollection(unlistedCollection.id))?.RecipesOnCollections.map(
        (x) => x.recipeId,
      ),
    ).toEqual([recipe.id]);
    expect(
      (await getCollection(privateCollection.id))?.RecipesOnCollections.map(
        (x) => x.recipeId,
      ),
    ).toEqual([recipe.id]);

    await recipesPutHandler.handler(
      author,
      {
        coverImageAction: "keep",
        visibility: RecipeVisibility.PRIVATE,
      },
      {
        id: recipe.id,
      },
    );

    expect(
      (await getCollection(unlistedCollection.id))?.RecipesOnCollections.map(
        (x) => x.recipeId,
      ),
    ).toEqual([]);
    expect(
      (await getCollection(privateCollection.id))?.RecipesOnCollections.map(
        (x) => x.recipeId,
      ),
    ).toEqual([recipe.id]);
  });

  test.each([
    [RecipeVisibility.PUBLIC, RecipeVisibility.PUBLIC, false],
    [RecipeVisibility.PUBLIC, RecipeVisibility.UNLISTED, false],
    [RecipeVisibility.PUBLIC, RecipeVisibility.PRIVATE, true],
    [RecipeVisibility.UNLISTED, RecipeVisibility.PUBLIC, false],
    [RecipeVisibility.UNLISTED, RecipeVisibility.UNLISTED, false],
    [RecipeVisibility.UNLISTED, RecipeVisibility.PRIVATE, true],
  ])(
    "making a %s recipe %s should remove the likes (%b)",
    async (originalVisibility, newVisibility, shouldRemoveLikes) => {
      const author = await createUserToDatabaseAndAuthenticate();
      const recipe = await createRecipe(
        author.userId,
        createRandomRecipe({
          visibility: originalVisibility,
        }),
        null,
      );

      const user = await createUserToDatabaseAndAuthenticate();
      await postLikeHandler.handler(user, { id: recipe.id });

      const beforeLikeCount = await getLikeCountForRecipe(recipe.id);
      expect(beforeLikeCount).toBe(1);

      await recipesPutHandler.handler(
        author,
        {
          coverImageAction: "keep",
          visibility: newVisibility,
        },
        {
          id: recipe.id,
        },
      );

      const afterLikeCount = await getLikeCountForRecipe(recipe.id);
      expect(afterLikeCount).toBe(shouldRemoveLikes ? 0 : 1);
    },
  );

  test("can not include ingredient sections from other recipes", async () => {
    const victim = await createUserToDatabaseAndAuthenticate();
    const victimRecipeShallow = await createRecipe(
      victim.userId,
      createRandomRecipe({
        visibility: RecipeVisibility.PUBLIC,
      }),
      null,
    );
    const victimRecipe = await getSingleRecipeWithoutCoverImageUrl(
      victimRecipeShallow.id,
    );

    if (!victimRecipe) {
      throw new Error("Recipe not found. This should never happen");
    }

    const attacker = await createUserToDatabaseAndAuthenticate();
    const attackerRecipe = await createRecipe(
      attacker.userId,
      createRandomRecipe({
        visibility: RecipeVisibility.PUBLIC,
      }),
      null,
    );

    await expect(
      recipesPutHandler.handler(
        attacker,
        {
          coverImageAction: "keep",
          visibility: RecipeVisibility.PUBLIC,
          ingredientSections: [
            {
              id: victimRecipe.ingredientSections[0].id,
              name: "Updated ingredient section name",
            },
          ],
        },
        {
          id: attackerRecipe.id,
        },
      ),
    ).rejects.toThrowError(
      new IngredientSectionsNotFoundError([
        victimRecipe.ingredientSections[0].id,
      ]),
    );
  });

  test("can not move ingredients between recipes", async () => {
    const victim = await createUserToDatabaseAndAuthenticate();
    const victimRecipeShallow = await createRecipe(
      victim.userId,
      createRandomRecipe({
        visibility: RecipeVisibility.PUBLIC,
      }),
      null,
    );
    const victimRecipe = await getSingleRecipeWithoutCoverImageUrl(
      victimRecipeShallow.id,
    );

    if (!victimRecipe) {
      throw new Error("Recipe not found. This should never happen");
    }

    const attacker = await createUserToDatabaseAndAuthenticate();
    const attackerRecipeShallow = await createRecipe(
      attacker.userId,
      createRandomRecipe({
        visibility: RecipeVisibility.PUBLIC,
      }),
      null,
    );
    const attackerRecipe = await getSingleRecipeWithoutCoverImageUrl(
      attackerRecipeShallow.id,
    );

    if (!attackerRecipe) {
      throw new Error("Recipe not found. This should never happen");
    }

    await expect(
      recipesPutHandler.handler(
        attacker,
        {
          coverImageAction: "keep",
          visibility: RecipeVisibility.PUBLIC,
          ingredientSections: [
            {
              id: attackerRecipe.ingredientSections[0].id,
              name: "Updated ingredient section name",
              ingredients: [
                {
                  id: victimRecipe.ingredientSections[0].ingredients[0].id,
                  quantity: 1,
                  name: "Updated ingredient name",
                  unit: "TABLESPOON" as const,
                },
              ],
            },
          ],
        },
        {
          id: attackerRecipe.id,
        },
      ),
    ).rejects.toThrowError(
      new IngredientsNotFoundError([
        victimRecipe.ingredientSections[0].ingredients[0].id,
      ]),
    );
  });

  test("can not move instructions to other recipes", async () => {
    const victim = await createUserToDatabaseAndAuthenticate();
    const victimRecipeShallow = await createRecipe(
      victim.userId,
      createRandomRecipe({
        visibility: RecipeVisibility.PUBLIC,
      }),
      null,
    );
    const victimRecipe = await getSingleRecipeWithoutCoverImageUrl(
      victimRecipeShallow.id,
    );

    if (!victimRecipe) {
      throw new Error("Recipe not found. This should never happen");
    }

    const attacker = await createUserToDatabaseAndAuthenticate();
    const attackerRecipeShallow = await createRecipe(
      attacker.userId,
      createRandomRecipe({
        visibility: RecipeVisibility.PUBLIC,
      }),
      null,
    );
    const attackerRecipe = await getSingleRecipeWithoutCoverImageUrl(
      attackerRecipeShallow.id,
    );

    if (!attackerRecipe) {
      throw new Error("Recipe not found. This should never happen");
    }

    await expect(
      recipesPutHandler.handler(
        attacker,
        {
          coverImageAction: "keep",
          visibility: RecipeVisibility.PUBLIC,
          instructions: [
            {
              id: victimRecipe.instructions[0].id,
              description: "Updated instruction text",
            },
          ],
        },
        {
          id: attackerRecipe.id,
        },
      ),
    ).rejects.toThrowError(
      new InstructionsNotFoundError([victimRecipe.instructions[0].id]),
    );
  });
});
