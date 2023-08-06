import {
  getPublicCollections,
  getUserCollections,
} from "../../../database/collections";
import { PropsLoaderHandler } from "../../loadProps";

export const browseCollectionsDataLoader = {
  requireUser: false,
  requiredTranslationNamespaces: ["common", "browse"],
  handler: async (user) => {
    const publicCollections = await getPublicCollections();
    const userCollections = user ? await getUserCollections(user.userId) : null;

    return {
      publicCollections,
      userCollections,
    };
  },
} satisfies PropsLoaderHandler;
