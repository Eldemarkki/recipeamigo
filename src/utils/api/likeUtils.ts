import { getLikeStatus } from "../../database/likes";
import { getSingleRecipe } from "../../database/recipes";
import { AuthorizedUser } from "../auth";
import { HttpError, RecipeNotFoundError } from "../errors";
import { hasReadAccessToRecipe } from "../recipeUtils";

export const canLikeOrUnlikeRecipe = async <
  CannotOperateOwnRecipeError extends string,
  NotOperableStateError extends string,
>(
  user: AuthorizedUser,
  recipeId: string,
  requiredLikeState: boolean,
  errors: {
    cannotOperateOwnRecipe: CannotOperateOwnRecipeError;
    notOperableState: NotOperableStateError;
  },
): Promise<void> => {
  const recipe = await getSingleRecipe(recipeId);

  if (recipe === null) throw new RecipeNotFoundError(recipeId);
  if (!hasReadAccessToRecipe(user, recipe))
    throw new RecipeNotFoundError(recipeId);
  if (recipe.userId === user.userId)
    throw new HttpError(errors.cannotOperateOwnRecipe, 403);

  const hasAlreadyLiked = await getLikeStatus(user.userId, recipeId);

  if (!!hasAlreadyLiked === requiredLikeState) {
    throw new HttpError(errors.notOperableState, 409);
  }
};
