import {
  getPublicCollections,
  getUserCollections,
} from "../../../database/collections";
import { PropsLoaderHandler } from "../../loadProps";

export const browseCollectionsDataLoader = {
  requireUser: false,
  requiredTranslationNamespaces: ["common", "browse"],
  handler: async (user) => {
    const userId = user ? user.userId : undefined;

    const publicCollections = await getPublicCollections();
    const userCollections = userId ? await getUserCollections(userId) : null;

    return {
      publicCollections,
      userCollections,
    };
  },
} satisfies PropsLoaderHandler;
