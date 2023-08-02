import { createCollection } from "../../database/collections";
import { AuthorizedUserRequestHandler } from "../../utils/apiUtils";
import { RecipeCollectionVisibility } from "@prisma/client";
import { z } from "zod";

export const collectionVisibilitySchema = z.nativeEnum(
  RecipeCollectionVisibility,
);

export const createCollectionSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  visibility: collectionVisibilitySchema,
  recipeIds: z.array(z.string()),
});

export const collectionsPostHandler = (async (user, body) => {
  const collection = await createCollection(user.userId, body);
  return collection;
}) satisfies AuthorizedUserRequestHandler<
  z.infer<typeof createCollectionSchema>
>;
