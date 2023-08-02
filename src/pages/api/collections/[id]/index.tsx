import {
  editCollection,
  getCollection,
} from "../../../../database/collections";
import { collectionVisibilitySchema } from "../../../../handlers/collections/collectionsPostHandler";
import { getUserFromRequest } from "../../../../utils/auth";
import { hasWriteAccessToCollection } from "../../../../utils/collectionUtils";
import { queryParamToString } from "../../../../utils/stringUtils";
import { NextApiHandler } from "next";
import { z } from "zod";

export const editCollectionSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  visibility: collectionVisibilitySchema,
  recipeIds: z.array(z.string()),
});

const handler = (async (req, res) => {
  if (req.method === "PUT") {
    const collection = editCollectionSchema.safeParse(req.body);
    if (!collection.success) {
      res.status(400).json(collection.error);
      return;
    }

    const id = queryParamToString(req.query.id) ?? "";
    if (!id) {
      throw new Error("No id provided. This should never happen");
    }

    const user = await getUserFromRequest(req);
    if (user.status === "Unauthorized") {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const originalCollection = await getCollection(id);

    if (!originalCollection) {
      res.status(404).json({ message: "Not found" });
      return;
    }

    if (!hasWriteAccessToCollection(user, originalCollection)) {
      res.status(404).json({ message: "Not found" });
      return;
    }

    const editedCollection = await editCollection(
      user.userId,
      id,
      collection.data,
    );
    res.status(200).json(editedCollection);
  }
}) satisfies NextApiHandler;

export default handler;
