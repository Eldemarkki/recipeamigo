import {
  getUserCollectionsWithMaximumVisibility,
  getUserRecipeCollectionRelationships,
} from "../../database/collections";
import { getLikeCountForRecipe, getLikeStatus } from "../../database/likes";
import {
  getSingleRecipe,
  increaseViewCountForRecipe,
} from "../../database/recipes";
import { RecipeNotFoundError } from "../../utils/errors";
import { hasReadAccessToRecipe } from "../../utils/recipeUtils";
import type { PropsLoaderHandler } from "../loadProps";
import filenamify from "filenamify";
import { z } from "zod";

export const recipePageDataLoader = {
  requireUser: false,
  requiredTranslationNamespaces: ["common", "recipeView"],
  queryValidator: z.object({ id: z.string() }),
  handler: async (user, { id: recipeId }) => {
    const recipe = await getSingleRecipe(recipeId);
    if (!recipe || !hasReadAccessToRecipe(user, recipe)) {
      throw new RecipeNotFoundError(recipeId);
    }

    const likeCount = await getLikeCountForRecipe(recipeId);

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

    await increaseViewCountForRecipe(recipeId);

    return {
      recipe,
      likeCount,
      exportJsonFilename,
      exportMarkdownFilename,
      ...userIdAndInfo,
    };
  },
} satisfies PropsLoaderHandler<{
  id: string;
}>;