import { getLikeStatus } from "../../database/likes";
import { getSingleRecipe } from "../../database/recipes";
import type { AuthorizedUser } from "../auth";
import {
  CannotLikeOwnRecipeError,
  CannotUnlikeOwnRecipeError,
  RecipeAlreadyLikedError,
  RecipeAlreadyUnlikedError,
  RecipeNotFoundError,
} from "../errors";
import { hasReadAccessToRecipe } from "../recipeUtils";

export const canLikeOrUnlikeRecipe = async (
  user: AuthorizedUser,
  recipeId: string,
  requiredLikeState: boolean,
): Promise<void> => {
  const recipe = await getSingleRecipe(recipeId);

  if (recipe === null) throw new RecipeNotFoundError(recipeId);
  if (!hasReadAccessToRecipe(user, recipe))
    throw new RecipeNotFoundError(recipeId);
  if (recipe.userId === user.userId) {
    if (requiredLikeState) {
      throw new CannotLikeOwnRecipeError();
    } else {
      throw new CannotUnlikeOwnRecipeError();
    }
  }

  const hasAlreadyLiked = await getLikeStatus(user.userId, recipeId);

  if (!!hasAlreadyLiked === requiredLikeState) {
    if (requiredLikeState) throw new RecipeAlreadyLikedError(recipeId);
    else throw new RecipeAlreadyUnlikedError(recipeId);
  }
};
