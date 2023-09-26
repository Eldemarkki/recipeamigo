import {
  deleteCollection,
  getCollectionWithoutCoverImages,
} from "../../database/collections";
import type { Handler } from "../../utils/apiUtils";
import { hasWriteAccessToCollection } from "../../utils/collectionUtils";
import { CollectionNotFoundError } from "../../utils/errors";
import { z } from "zod";

export const collectionsIdDeleteHandler = {
  requireUser: true,
  queryValidator: z.object({
    id: z.string(),
  }),
  handler: async (user, query) => {
    const collection = await getCollectionWithoutCoverImages(query.id);
    if (!collection || !hasWriteAccessToCollection(user, collection)) {
      throw new CollectionNotFoundError(query.id);
    }

    await deleteCollection(query.id);
  },
} satisfies Handler<never, { id: string }>;
