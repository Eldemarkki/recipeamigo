import { prisma } from "../../../db";
import { canLikeOrUnlikeRecipe } from "../../../utils/api/likeUtils";
import type { Handler } from "../../../utils/apiUtils";
import { z } from "zod";

export const postLikeHandler = {
  requireUser: true,
  queryValidator: z.object({
    id: z.string(),
  }),
  handler: async (user, query) => {
    const recipeId = query.id;

    await canLikeOrUnlikeRecipe(user, recipeId, true);

    await prisma.like.create({
      data: {
        userId: user.userId,
        recipeId,
      },
    });

    return { message: "Recipe liked" };
  },
} satisfies Handler<unknown, { id: string }>;
