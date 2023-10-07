import { prisma } from "../../../db";
import { canLikeOrUnlikeRecipe } from "../../../utils/api/likeUtils";
import type { Handler } from "../../../utils/apiUtils";
import { z } from "zod";

export const postUnlikeHandler = {
  requireUser: true,
  queryValidator: z.object({
    id: z.string(),
  }),
  handler: async (user, query) => {
    const recipeId = query.id;

    await canLikeOrUnlikeRecipe(user, recipeId, false);

    await prisma.like.deleteMany({
      where: {
        userId: user.userId,
        recipeId,
      },
    });

    return { message: "Recipe unliked" };
  },
} satisfies Handler<unknown, { id: string }>;
