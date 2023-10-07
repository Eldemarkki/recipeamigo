import {
  getUserCollectionsWithMaximumVisibility,
  getUserRecipeCollectionRelationships,
} from "../../database/collections";
import { getSingleRecipe } from "../../database/recipes";
import { prisma } from "../../db";
import { getLikeStatus } from "../../utils/api/likeUtils";
import { RecipeNotFoundError } from "../../utils/errors";
import { hasReadAccessToRecipe } from "../../utils/recipeUtils";
import type { PropsLoaderHandler } from "../loadProps";
import filenamify from "filenamify";
import { z } from "zod";

export const recipePageDataLoader = {
  requireUser: false,
  queryValidator: z.object({ id: z.string() }),
  handler: async (user, { id: recipeId }) => {
    const recipe = await getSingleRecipe(recipeId);
    if (!recipe || !hasReadAccessToRecipe(user, recipe)) {
      throw new RecipeNotFoundError(recipeId);
    }

    const userIdAndInfo = !user
      ? ({
          userId: null,
        } as const)
      : ({
          userId: user.userId,
          likeStatus: !!(await getLikeStatus(user.userId, recipeId)),
          allCollections: await getUserCollectionsWithMaximumVisibility(
            user.userId,
            recipe.visibility,
          ),
          collectionRelationships: await getUserRecipeCollectionRelationships(
            recipeId,
            user.userId,
          ),
        } as const);

    const exportJsonFilename = filenamify(recipe.name + ".json", {
      replacement: "_",
    });
    const exportMarkdownFilename = filenamify(recipe.name + ".md", {
      replacement: "_",
    });

    // Increase view count
    // No need to run as `await` since we don't care about the result
    void prisma.recipe
      .update({
        where: {
          id: recipeId,
        },
        data: {
          viewCount: {
            increment: 1,
          },
        },
      })
      .then(() => {});

    return {
      recipe,
      exportJsonFilename,
      exportMarkdownFilename,
      ...userIdAndInfo,
    };
  },
} satisfies PropsLoaderHandler<{
  id: string;
}>;
