import { getLikeStatus } from "../../database/likes";
import { getSingleRecipe } from "../../database/recipes";
import { AuthorizedUser } from "../auth";
import {
  CannotLikeOwnRecipe,
  CannotUnlikeOwnRecipe,
  RecipeAlreadyLiked,
  RecipeAlreadyUnliked,
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
      throw new CannotLikeOwnRecipe();
    } else {
      throw new CannotUnlikeOwnRecipe();
    }
  }

  const hasAlreadyLiked = await getLikeStatus(user.userId, recipeId);

  if (!!hasAlreadyLiked === requiredLikeState) {
    if (requiredLikeState) throw new RecipeAlreadyLiked(recipeId);
    else throw new RecipeAlreadyUnliked(recipeId);
  }
};
