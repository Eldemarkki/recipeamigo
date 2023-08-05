import { unlikeRecipe } from "../../../database/likes";
import { canLikeOrUnlikeRecipe } from "../../../utils/api/likeUtils";
import { Handler } from "../../../utils/apiUtils";
import { z } from "zod";

export const postUnlikeHandler = {
  requireUser: true,
  queryValidator: z.object({
    id: z.string(),
  }),
  handler: async (user, query) => {
    const recipeId = query.id;

    await canLikeOrUnlikeRecipe(user, recipeId, false);

    await unlikeRecipe(user.userId, recipeId);
    return { message: "Recipe unliked" };
  },
} satisfies Handler<{}, { id: string }>;
