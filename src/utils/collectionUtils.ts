import { AnyUser } from "./auth";
import {
  RecipeCollection,
  RecipeCollectionVisibility,
  RecipeVisibility,
} from "@prisma/client";

export const hasReadAccessToCollection = (
  user: AnyUser | null,
  collection: RecipeCollection,
) => {
  if (
    collection.visibility === RecipeCollectionVisibility.PUBLIC ||
    collection.visibility === RecipeCollectionVisibility.UNLISTED
  ) {
    return true;
  }

  if (collection.visibility === RecipeCollectionVisibility.PRIVATE) {
    if (!user) {
      return false;
    }

    if (user.status === "Unauthorized") {
      return false;
    }

    return collection.userId === user.userId;
  }

  return false;
};

export const hasWriteAccessToCollection = (
  user: AnyUser,
  collection: RecipeCollection,
) => {
  if (user.status === "Unauthorized") {
    return false;
  }

  return collection.userId === user.userId;
};

export const isVisibilityValidForCollection = (
  recipeVisibility: RecipeVisibility,
  collectionVisibility: RecipeCollectionVisibility,
) => {
  if (collectionVisibility === RecipeCollectionVisibility.PRIVATE) {
    return true;
  } else if (collectionVisibility === RecipeCollectionVisibility.UNLISTED) {
    return (
      recipeVisibility === RecipeVisibility.PUBLIC ||
      recipeVisibility === RecipeVisibility.UNLISTED
    );
  } else if (collectionVisibility === RecipeCollectionVisibility.PUBLIC) {
    return recipeVisibility === RecipeVisibility.PUBLIC;
  }

  throw new Error("Invalid collection visibility");
};

export const isValidVisibilityConfiguration = <
  T extends { visibility: RecipeVisibility },
>(
  recipeCollectionVisibility: RecipeCollectionVisibility,
  recipes: T[],
) => {
  const violatingRecipes = recipes.filter(
    (recipe) =>
      !isVisibilityValidForCollection(
        recipe.visibility,
        recipeCollectionVisibility,
      ),
  );

  return {
    isValid: violatingRecipes.length === 0,
    violatingRecipes,
  };
};
