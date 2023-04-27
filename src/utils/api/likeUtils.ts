import { getSingleRecipe } from "../../database/recipes";
import { getLikeStatus } from "../../database/likes";

type CanLikeOrUnlikeRecipeResult<
  CannotOperateOwnRecipeError extends string,
  NotOperableStateError extends string
> = {
  statusCode: 404;
  message: "Recipe not found";
} | {
  statusCode: 403;
  message: CannotOperateOwnRecipeError;
} | {
  statusCode: 409;
  message: NotOperableStateError;
} | true;

export const canLikeOrUnlikeRecipe = async <
  CannotOperateOwnRecipeError extends string,
  NotOperableStateError extends string
>(
  userId: string,
  recipeId: string,
  requiredLikeState: boolean,
  errors: {
    cannotOperateOwnRecipe: CannotOperateOwnRecipeError;
    notOperableState: NotOperableStateError;
  }
): Promise<CanLikeOrUnlikeRecipeResult<CannotOperateOwnRecipeError, NotOperableStateError>> => {
  const recipe = await getSingleRecipe(recipeId);
  if (recipe === null) {
    return {
      statusCode: 404,
      message: "Recipe not found"
    };
  }

  if (recipe.userId === userId) {
    return {
      statusCode: 403,
      message: errors.cannotOperateOwnRecipe
    };
  }

  if (!recipe.isPublic) {
    // User doesn't own the recipe and it is private
    return {
      statusCode: 404,
      message: "Recipe not found"
    };
  }

  const hasAlreadyLiked = await getLikeStatus(userId, recipeId);

  if (!!hasAlreadyLiked === requiredLikeState) {
    return {
      statusCode: 409,
      message: errors.notOperableState
    };
  }

  return true;
};
