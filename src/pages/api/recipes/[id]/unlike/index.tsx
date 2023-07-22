import { NextApiHandler } from "next";
import { getUserFromRequest } from "../../../../../utils/auth";
import { unlikeRecipe } from "../../../../../database/likes";
import { canLikeOrUnlikeRecipe } from "../../../../../utils/api/likeUtils";

const handler: NextApiHandler = async (req, res) => {
  const recipeId = req.query.id;
  if (typeof recipeId !== "string") {
    throw new Error("Recipe id is not a string. This should never happen.");
  }

  if (req.method === "POST") {
    const user = await getUserFromRequest(req);
    if (user.status !== "OK") {
      return {
        statusCode: 401,
        message: "You are not logged in",
      };
    }

    const canLike = await canLikeOrUnlikeRecipe(user.userId, recipeId, false, {
      notOperableState: "You have already unliked this recipe",
      cannotOperateOwnRecipe: "You cannot unlike your own recipe",
    });

    if (canLike === true) {
      await unlikeRecipe(user.userId, recipeId);
      return res.status(200).json({ message: "Recipe unliked" });
    }

    return res.status(canLike.statusCode).json({ error: canLike.message });
  }

  return res.status(405).end();
};

export default handler;
