import {
  getCollection,
  setRecipeToRecipeCollectionRelationships,
} from "../../../database/collections";
import { getSingleRecipeWithoutCoverImageUrl } from "../../../database/recipes";
import type { Handler } from "../../../utils/apiUtils";
import {
  getValidCollectionVisibilitiesForRecipeVisibility,
  hasReadAccessToCollection,
  hasWriteAccessToCollection,
} from "../../../utils/collectionUtils";
import {
  CannotAddRecipeToCollectionsDontExistOrNoReadAccessError,
  CannotAddRecipeToCollectionsInvalidVisibilityError,
  CannotAddRecipeToCollectionsNoWriteAccessError,
  RecipeNotFoundError,
} from "../../../utils/errors";
import { hasReadAccessToRecipe } from "../../../utils/recipeUtils";
import { z } from "zod";

export const recipePostAddToCollectionsHandler = {
  requireUser: true,
  queryValidator: z.object({ id: z.string().uuid() }),
  bodyValidator: z.object({ collectionIds: z.array(z.string().uuid()) }),
  handler: async (user, body, query) => {
    const recipeId = query.id;
    const recipe = await getSingleRecipeWithoutCoverImageUrl(recipeId);
    if (!(recipe && hasReadAccessToRecipe(user, recipe))) {
      throw new RecipeNotFoundError(recipeId);
    }

    const collections = await Promise.all(
      body.collectionIds.map(async (collectionId) => ({
        requestedId: collectionId,
        collection: await getCollection(collectionId),
      })),
    );

    const readAccesses = collections.map(({ collection, requestedId }) => {
      if (!collection) {
        return {
          collectionId: requestedId,
          readAccess: false,
        };
      }

      return {
        collectionId: requestedId,
        readAccess: hasReadAccessToCollection(user, collection),
      };
    });

    const collectionsWithoutReadAccess = readAccesses.filter(
      ({ readAccess }) => !readAccess,
    );

    if (collectionsWithoutReadAccess.length > 0) {
      throw new CannotAddRecipeToCollectionsDontExistOrNoReadAccessError(
        recipeId,
        collectionsWithoutReadAccess.map(({ collectionId }) => collectionId),
      );
    }

    const writeAccesses = collections.map(({ collection, requestedId }) => {
      if (!collection) {
        throw new Error(
          "Collection should exist at this point. This should never happen.",
        );
      }

      return {
        collectionId: requestedId,
        writeAccess: hasWriteAccessToCollection(user, collection),
      };
    });

    const collectionsWithoutWriteAccess = writeAccesses.filter(
      ({ writeAccess }) => !writeAccess,
    );

    if (collectionsWithoutWriteAccess.length > 0) {
      throw new CannotAddRecipeToCollectionsNoWriteAccessError(
        recipeId,
        collectionsWithoutWriteAccess.map(({ collectionId }) => collectionId),
      );
    }

    const allowedVisibilities =
      getValidCollectionVisibilitiesForRecipeVisibility(recipe.visibility);

    const collectionsWithInvalidVisibility = collections.filter(
      (c) =>
        c.collection && !allowedVisibilities.includes(c.collection.visibility),
    );

    if (collectionsWithInvalidVisibility.length > 0) {
      throw new CannotAddRecipeToCollectionsInvalidVisibilityError(
        recipeId,
        collectionsWithInvalidVisibility.map(({ requestedId }) => requestedId),
      );
    }

    await setRecipeToRecipeCollectionRelationships(
      recipeId,
      user.userId,
      body.collectionIds,
    );
  },
} satisfies Handler<{ collectionIds: string[] }, { id: string }>;
