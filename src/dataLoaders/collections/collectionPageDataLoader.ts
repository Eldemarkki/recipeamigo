import { getCollection } from "../../database/collections";
import { getAllRecipesForUser } from "../../database/recipes";
import { hasReadAccessToCollection } from "../../utils/collectionUtils";
import { CollectionNotFoundError } from "../../utils/errors";
import { PropsLoaderHandler } from "../loadProps";
import { z } from "zod";

export const collectionPageDataLoader = {
  requireUser: false,
  requiredTranslationNamespaces: [
    "common",
    "home",
    "recipeView",
    "collections",
  ],
  queryValidator: z.object({ id: z.string() }),
  handler: async (user, query) => {
    const id = query.id;

    const collection = await getCollection(id);
    if (!collection || !hasReadAccessToCollection(user, collection)) {
      throw new CollectionNotFoundError(id);
    }

    const isOwner = user && user.userId === collection.userId;

    // This is for providing the recipe list for the editing dialog
    const allRecipes = isOwner ? await getAllRecipesForUser(user.userId) : null;

    const recipesAndOwner = isOwner
      ? ({
          allRecipes,
          isOwner: true,
        } as const)
      : ({
          isOwner: false,
        } as const);

    return {
      collection,
      ...recipesAndOwner,
    };
  },
} satisfies PropsLoaderHandler<{ id: string }>;
