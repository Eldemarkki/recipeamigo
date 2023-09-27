import { getCollectionWithoutCoverImages } from "../../database/collections";
import {
  createRecipe,
  getSingleRecipeWithoutCoverImageUrl,
} from "../../database/recipes";
import { CollectionNotFoundError } from "../../utils/errors";
import { createRandomRecipe } from "../../utils/tests/recipes";
import { createUserToDatabaseAndAuthenticate } from "../../utils/tests/testUtils";
import { collectionsIdDeleteHandler } from "./collectionsIdDeleteHandler";
import { collectionsPostHandler } from "./collectionsPostHandler";
import { RecipeCollectionVisibility } from "@prisma/client";

describe("collectionsIdDeleteHandler", () => {
  test("can delete own collection", async () => {
    const user = await createUserToDatabaseAndAuthenticate();

    const recipe = await createRecipe(user.userId, createRandomRecipe(), null);
    const createdCollection = await collectionsPostHandler.handler(user, {
      name: "test",
      recipeIds: [recipe.id],
      visibility: RecipeCollectionVisibility.PRIVATE,
      description: "test",
    });

    await collectionsIdDeleteHandler.handler(user, {
      id: createdCollection.id,
    });

    const foundCollection = await getCollectionWithoutCoverImages(
      createdCollection.id,
    );

    expect(foundCollection).toBeNull();
  });

  test("cannot delete non-existent collection", async () => {
    const user = await createUserToDatabaseAndAuthenticate();

    await expect(
      collectionsIdDeleteHandler.handler(user, {
        id: "non-existent",
      }),
    ).rejects.toThrowError(new CollectionNotFoundError("non-existent"));
  });

  test("cannot delete other people's collection", async () => {
    const author = await createUserToDatabaseAndAuthenticate();
    const createdCollection = await collectionsPostHandler.handler(author, {
      name: "test",
      recipeIds: [],
      visibility: RecipeCollectionVisibility.PRIVATE,
      description: "test",
    });

    const user = await createUserToDatabaseAndAuthenticate();
    await expect(
      collectionsIdDeleteHandler.handler(user, {
        id: createdCollection.id,
      }),
    ).rejects.toThrowError(new CollectionNotFoundError(createdCollection.id));

    const foundCollection = await getCollectionWithoutCoverImages(
      createdCollection.id,
    );
    expect(foundCollection).not.toBeNull();
  });

  test("deleting collection should not delete recipes", async () => {
    const user = await createUserToDatabaseAndAuthenticate();
    const recipe = await createRecipe(user.userId, createRandomRecipe(), null);
    const createdCollection = await collectionsPostHandler.handler(user, {
      name: "test",
      recipeIds: [recipe.id],
      visibility: RecipeCollectionVisibility.PRIVATE,
      description: "test",
    });

    await collectionsIdDeleteHandler.handler(user, {
      id: createdCollection.id,
    });

    const foundRecipe = await getSingleRecipeWithoutCoverImageUrl(recipe.id);
    expect(foundRecipe).not.toBeNull();

    const foundCollection = await getCollectionWithoutCoverImages(
      createdCollection.id,
    );
    expect(foundCollection).toBeNull();
  });
});
