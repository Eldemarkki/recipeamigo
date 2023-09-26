import { getCollection } from "../../database/collections";
import { getAllRecipesForUser } from "../../database/recipes";
import { hasWriteAccessToCollection } from "../../utils/collectionUtils";
import { CollectionNotFoundError } from "../../utils/errors";
import type { PropsLoaderHandler } from "../loadProps";
import { z } from "zod";

export const collectionEditPageDataLoader = {
  requireUser: true,
  handler: async (user, query) => {
    const id = query.id;

    const collection = await getCollection(id);
    if (!collection || !hasWriteAccessToCollection(user, collection)) {
      throw new CollectionNotFoundError(id);
    }

    const allRecipes = await getAllRecipesForUser(user.userId);

    return {
      collection,
      allRecipes,
    };
  },
  queryValidator: z.object({
    id: z.string(),
  }),
} satisfies PropsLoaderHandler<{ id: string }>;
