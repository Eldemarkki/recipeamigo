import {
  deleteRecipeById,
  getSingleRecipeWithoutCoverImageUrl,
} from "../../database/recipes";
import type { Handler } from "../../utils/apiUtils";
import { RecipeNotFoundError } from "../../utils/errors";
import { hasWriteAccessToRecipe } from "../../utils/recipeUtils";
import { z } from "zod";

export const recipesDeleteHandler = {
  requireUser: true,
  queryValidator: z.object({
    id: z.string().uuid(),
  }),
  handler: async (user, query) => {
    const id = query.id;
    const recipe = await getSingleRecipeWithoutCoverImageUrl(id);

    if (!recipe || !hasWriteAccessToRecipe(user, recipe)) {
      throw new RecipeNotFoundError(id);
    }

    await deleteRecipeById(id);
  },
} satisfies Handler<never, { id: string }>;
