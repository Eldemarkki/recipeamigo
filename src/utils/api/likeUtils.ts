import { getLikeStatus } from "../../database/likes";
import { getSingleRecipe } from "../../database/recipes";
import { AuthorizedUser, getUserFromRequest } from "../auth";
import { hasReadAccessToRecipe } from "../recipeUtils";

type CanLikeOrUnlikeRecipeResult<
  CannotOperateOwnRecipeError extends string,
  NotOperableStateError extends string,
> =
  | {
      statusCode: 404;
      message: "Recipe not found";
    }
  | {
      statusCode: 403;
      message: CannotOperateOwnRecipeError;
    }
  | {
      statusCode: 409;
      message: NotOperableStateError;
    }
  | true;

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
): Promise<
  CanLikeOrUnlikeRecipeResult<
    CannotOperateOwnRecipeError,
    NotOperableStateError
  >
> => {
  const recipe = await getSingleRecipe(recipeId);
  if (recipe === null) {
    return {
      statusCode: 404,
      message: "Recipe not found",
    };
  }

  if (recipe.userId === user.userId) {
    return {
      statusCode: 403,
      message: errors.cannotOperateOwnRecipe,
    };
  }

  if (!hasReadAccessToRecipe(user, recipe)) {
    return {
      statusCode: 404,
      message: "Recipe not found",
    };
  }

  const hasAlreadyLiked = await getLikeStatus(user.userId, recipeId);

  if (!!hasAlreadyLiked === requiredLikeState) {
    return {
      statusCode: 409,
      message: errors.notOperableState,
    };
  }

  return true;
};
