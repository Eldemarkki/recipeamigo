import { getCollection } from "../../database/collections";
import { hasReadAccessToCollection } from "../../utils/collectionUtils";
import { CollectionNotFoundError } from "../../utils/errors";
import type { PropsLoaderHandler } from "../loadProps";
import { z } from "zod";

export const collectionPageDataLoader = {
  requireUser: false,
  requiredTranslationNamespaces: [
    "common",
    "home",
    "recipeView",
    "collections",
    "errors",
  ],
  queryValidator: z.object({ id: z.string() }),
  handler: async (user, query) => {
    const id = query.id;

    const collection = await getCollection(id);
    if (!collection || !hasReadAccessToCollection(user, collection)) {
      throw new CollectionNotFoundError(id);
    }

    const isOwner = user && user.userId === collection.userId;

    return {
      collection,
      isOwner,
    };
  },
} satisfies PropsLoaderHandler<{ id: string }>;
