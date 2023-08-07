import { createCollection } from "../../database/collections";
import type { Handler } from "../../utils/apiUtils";
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

export const collectionsPostHandler = {
  requireUser: true,
  bodyValidator: createCollectionSchema,
  handler: async (user, body) => {
    const collection = await createCollection(user.userId, body);
    return collection;
  },
} satisfies Handler<z.infer<typeof createCollectionSchema>>;
