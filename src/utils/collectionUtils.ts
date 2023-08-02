import { getUserFromRequest } from "./auth";
import { RecipeCollection, RecipeCollectionVisibility } from "@prisma/client";

export const hasReadAccessToCollection = (
  user: Awaited<ReturnType<typeof getUserFromRequest>>,
  collection: RecipeCollection,
) => {
  if (
    collection.visibility === RecipeCollectionVisibility.PUBLIC ||
    collection.visibility === RecipeCollectionVisibility.UNLISTED
  ) {
    return true;
  }

  if (collection.visibility === RecipeCollectionVisibility.PRIVATE) {
    if (user.status === "Unauthorized") {
      return false;
    }

    return collection.userId === user.userId;
  }

  return false;
};

export const hasWriteAccessToCollection = (
  user: Awaited<ReturnType<typeof getUserFromRequest>>,
  collection: RecipeCollection,
) => {
  if (user.status === "Unauthorized") {
    return false;
  }

  return collection.userId === user.userId;
};
