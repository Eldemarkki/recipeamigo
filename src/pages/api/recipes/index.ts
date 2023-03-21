import { NextApiHandler } from "next";
import { getUserFromRequest } from "../../../utils/auth";
import { createRecipe, getAllRecipesForUser } from "../../../database/recipes";
import z from "zod";
import { IngredientUnit } from "@prisma/client";

export const ingredientUnitSchema = z.nativeEnum(IngredientUnit);

export const ingredientSchema = z.object({
  name: z.string(),
  quantity: z.number().nonnegative(),
  unit: ingredientUnitSchema.optional()
});

export const createRecipeSchema = z.object({
  name: z.string(),
  description: z.string(),
  ingredients: z.array(ingredientSchema),
  instructions: z.array(z.string())
});

const handler: NextApiHandler = async (req, res) => {
  if (req.method === "GET") {
    const user = await getUserFromRequest(req);
    if (!user || typeof user === "string" || !user.sub) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const userId = user.sub;
    const recipes = await getAllRecipesForUser(userId);

    return res.status(200).json(recipes);
  }
  else if (req.method === "POST") {
    const user = await getUserFromRequest(req);
    if (!user || typeof user === "string" || !user.sub) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const userId = user.sub;

    const body = createRecipeSchema.safeParse(req.body);
    if (!body.success) {
      return res.status(400).json({ error: body.error });
    }

    const recipe = await createRecipe(userId, body.data);

    return res.status(200).json(recipe);
  }
};

export default handler;
