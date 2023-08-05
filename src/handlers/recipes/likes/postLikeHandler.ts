import { likeRecipe } from "../../../database/likes";
import { canLikeOrUnlikeRecipe } from "../../../utils/api/likeUtils";
import { Handler } from "../../../utils/apiUtils";
import { z } from "zod";

export const postLikeHandler = {
  requireUser: true,
  bodyValidator: z.object({}),
  queryValidator: z.object({
    id: z.string(),
  }),
  handler: async (user, _body, query) => {
    const recipeId = query.id;

    await canLikeOrUnlikeRecipe(user, recipeId, true, {
      notOperableState: "You have already liked this recipe",
      cannotOperateOwnRecipe: "You cannot like your own recipe",
    });

    await likeRecipe(user.userId, recipeId);
    return { message: "Recipe liked" };
  },
} satisfies Handler<{}, { id: string }>;
