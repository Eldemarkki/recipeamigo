import { getSingleRecipe } from "../../database/recipes";
import { RecipeNotFoundError } from "../../utils/errors";
import { hasWriteAccessToRecipe } from "../../utils/recipeUtils";
import type { PropsLoaderHandler } from "../loadProps";
import { z } from "zod";

export const editRecipePageDataLoader = {
  requireUser: true,
  queryValidator: z.object({
    id: z.string(),
  }),
  handler: async (user, query) => {
    const recipe = await getSingleRecipe(query.id);

    if (!recipe || !hasWriteAccessToRecipe(user, recipe)) {
      throw new RecipeNotFoundError(query.id);
    }

    return {
      recipe,
    };
  },
} satisfies PropsLoaderHandler<{
  id: string;
}>;
