import { getAllRecipesForUser } from "../../database/recipes";
import type { PropsLoaderHandler } from "../loadProps";

export const newCollectionPageDataLoader = {
  requireUser: true,
  requiredTranslationNamespaces: [
    "common",
    "collections",
    "home",
    "recipeView",
  ],
  handler: async (user) => {
    return {
      allRecipes: await getAllRecipesForUser(user.userId),
    };
  },
} satisfies PropsLoaderHandler;
