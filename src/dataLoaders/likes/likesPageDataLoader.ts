import { getLikedRecipes } from "../../database/recipes";
import type { PropsLoaderHandler } from "../loadProps";

export const likesPageDataLoader = {
  requireUser: true,
  handler: async (user) => {
    const likedRecipes = await getLikedRecipes(user.userId);
    return {
      likedRecipes,
    };
  },
} satisfies PropsLoaderHandler;
