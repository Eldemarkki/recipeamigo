import { NextApiHandler } from "next";
import { getUserFromRequest } from "../../../utils/auth";
import { createRecipe, getAllRecipesForUser } from "../../../database/recipes";
import z from "zod";
import { IngredientUnit } from "@prisma/client";

export const ingredientUnitSchema = z.nativeEnum(IngredientUnit);

export const ingredientSchema = z.object({
  name: z.string(),
  quantity: z.number().nonnegative(),
  unit: ingredientUnitSchema.optional().nullable(),
  isOptional: z.boolean().optional()
});

export const ingredientSectionSchema = z.object({
  name: z.string(),
  ingredients: z.array(ingredientSchema)
});

export const createRecipeSchema = z.object({
  name: z.string(),
  description: z.string(),
  ingredientSections: z.array(ingredientSectionSchema),
  instructions: z.array(z.string()),
  quantity: z.number().min(1),
  isPublic: z.boolean(),
  timeEstimateMinimumMinutes: z.number().min(0).optional(),
  timeEstimateMaximumMinutes: z.number().min(0).optional()
});

const handler: NextApiHandler = async (req, res) => {
  if (req.method === "GET") {
    const user = await getUserFromRequest(req);
    if (user.status === "Unauthorized") {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const recipes = await getAllRecipesForUser(user.userId);

    return res.status(200).json(recipes);
  }
  else if (req.method === "POST") {
    const user = await getUserFromRequest(req);
    if (user.status === "Unauthorized") {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const body = createRecipeSchema.safeParse(req.body);
    if (!body.success) {
      return res.status(400).json({ error: body.error });
    }

    // This is to prevent users without a profile from creating public recipes by calling
    // the API directly. It is required, because the frontend requires a username
    // to display on public recipes.
    if (body.data.isPublic && user.status === "No profile") {
      return res.status(400).json({ error: "You must have a profile to be able to create public recipes" });
    }

    const recipe = await createRecipe(user.userId, body.data);

    return res.status(200).json(recipe);
  }
};

export default handler;
