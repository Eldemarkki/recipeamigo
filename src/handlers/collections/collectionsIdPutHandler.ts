import { editCollection } from "../../database/collections";
import type { Handler } from "../../utils/apiUtils";
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
  handler: async (user, body, query) =>
    await editCollection(user.userId, query.id, body),
} satisfies Handler<z.infer<typeof editCollectionSchema>, { id: string }>;
