import { NextApiHandler } from "next";
import { getUserIdFromRequest } from "../../../utils/auth";
import { createRecipe, getAllRecipesForUser } from "../../../database/recipes";
import z from "zod";
import { IngredientUnit } from "@prisma/client";

export const ingredientUnitSchema = z.nativeEnum(IngredientUnit);

export const ingredientSchema = z.object({
  name: z.string(),
  quantity: z.number().nonnegative(),
  unit: ingredientUnitSchema.optional().nullable()
});

export const createRecipeSchema = z.object({
  name: z.string(),
  description: z.string(),
  ingredients: z.array(ingredientSchema),
  instructions: z.array(z.string()),
  quantity: z.number().min(1),
  isPublic: z.boolean()
});

const handler: NextApiHandler = async (req, res) => {
  if (req.method === "GET") {
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const recipes = await getAllRecipesForUser(userId);

    return res.status(200).json(recipes);
  }
  else if (req.method === "POST") {
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const body = createRecipeSchema.safeParse(req.body);
    if (!body.success) {
      return res.status(400).json({ error: body.error });
    }

    const recipe = await createRecipe(userId, body.data);

    return res.status(200).json(recipe);
  }
};

export default handler;
