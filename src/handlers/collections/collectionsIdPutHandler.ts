import { editCollection, getCollection } from "../../database/collections";
import type { Handler } from "../../utils/apiUtils";
import { hasWriteAccessToCollection } from "../../utils/collectionUtils";
import { CollectionNotFoundError } from "../../utils/errors";
import { RecipeCollectionVisibility } from "@prisma/client";
import { z } from "zod";

export const editCollectionSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  visibility: z.nativeEnum(RecipeCollectionVisibility),
  recipeIds: z.array(z.string()),
});

export const collectionsIdPutHandler = {
  requireUser: true,
  bodyValidator: editCollectionSchema,
  queryValidator: z.object({
    id: z.string(),
  }),
  handler: async (user, body, query) => {
    const originalCollection = await getCollection(query.id);

    if (!originalCollection) throw new CollectionNotFoundError(query.id);
    if (!hasWriteAccessToCollection(user, originalCollection))
      throw new CollectionNotFoundError(query.id);

    const editedCollection = await editCollection(user.userId, query.id, body);
    return editedCollection;
  },
} satisfies Handler<z.infer<typeof editCollectionSchema>, { id: string }>;
