import {
  getPublicCollections,
  getUserCollections,
} from "../../../database/collections";
import type { PropsLoaderHandler } from "../../loadProps";

export const browseCollectionsDataLoader = {
  requireUser: false,
  handler: async (user) => {
    const publicCollections = await getPublicCollections();
    const userCollections = user ? await getUserCollections(user.userId) : null;

    return {
      publicCollections,
      userCollections,
    };
  },
} satisfies PropsLoaderHandler;
