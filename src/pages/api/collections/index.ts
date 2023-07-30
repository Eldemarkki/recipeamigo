import { RecipeCollectionVisibility } from "@prisma/client";
import { NextApiHandler } from "next";
import { z } from "zod";
import { createCollection } from "../../../database/collections";
import { getUserFromRequest } from "../../../utils/auth";

export const collectionVisibilitySchema = z.nativeEnum(
  RecipeCollectionVisibility,
);

export const createCollectionSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  visibility: collectionVisibilitySchema,
  recipeIds: z.array(z.string()),
});

const handler = (async (req, res) => {
  if (req.method === "POST") {
    const body = req.body;
    const result = createCollectionSchema.safeParse(body);
    if (!result.success) {
      return res.status(400).json({ message: "Invalid request body" });
    }

    const user = await getUserFromRequest(req);
    if (user.status === "Unauthorized") {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const collection = await createCollection(user.userId, result.data);
    return res.status(200).json(collection);
  }

  return res.status(405).end();
}) satisfies NextApiHandler;

export default handler;
