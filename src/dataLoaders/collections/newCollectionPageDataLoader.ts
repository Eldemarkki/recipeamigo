import { getAllRecipesForUser } from "../../database/recipes";
import type { PropsLoaderHandler } from "../loadProps";

export const newCollectionPageDataLoader = {
  requireUser: true,
  handler: async (user) => {
    return {
      allRecipes: await getAllRecipesForUser(user.userId),
    };
  },
} satisfies PropsLoaderHandler;
