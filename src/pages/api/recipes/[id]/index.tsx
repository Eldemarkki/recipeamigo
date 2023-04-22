import { z } from "zod";
import { ingredientUnitSchema } from "..";
import { NextApiHandler } from "next";
import { getUserFromRequest } from "../../../../utils/auth";
import { editRecipe, getSingleRecipe } from "../../../../database/recipes";

const newIngredientSchema = z.object({
  name: z.string(),
  quantity: z.number().nonnegative(),
  unit: ingredientUnitSchema.optional(),
  isOptional: z.boolean().optional()
}).strict();

const editIngredientSchema = newIngredientSchema.partial().and(z.object({ id: z.string().uuid() }));

const newIngredientSectionsSchema = z.array(editIngredientSchema.or(newIngredientSchema));
const editIngredientSectionsSchema = z.array(editIngredientSchema.or(newIngredientSchema)).optional();

const editingIngredientSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  ingredients: editIngredientSectionsSchema
}).strict().or(z.object({
  name: z.string(),
  ingredients: newIngredientSectionsSchema
}).strict());

export const editRecipeSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  ingredientSections: z.array(editingIngredientSchema).optional(),
  instructions: z.array(z.string()).optional(),
  quantity: z.number().min(1).optional(),
  isPublic: z.boolean().optional(),
  timeEstimateMinimumMinutes: z.number().min(0).optional(),
  timeEstimateMaximumMinutes: z.number().min(0).optional()
}).strict();

const handler: NextApiHandler = async (req, res) => {
  if (req.method === "PUT") {
    const id = req.query.id;
    if (typeof id !== "string") {
      throw new Error("Recipe id is not a string. This should never happen.");
    }

    const user = await getUserFromRequest(req);
    if (user.status !== "OK") {
      return res.status(401).end();
    }

    const originalRecipe = await getSingleRecipe(id);
    if (originalRecipe === null || originalRecipe.userId !== user.userId) {
      return res.status(404).end();
    }

    const recipeParsed = editRecipeSchema.safeParse(req.body);
    if (recipeParsed.success) {
      const recipe = recipeParsed.data;
      const edited = await editRecipe(id, recipe);
      return res.status(200).json(edited);
    }
    else {
      return res.status(400).json(recipeParsed.error);
    }
  }

  return res.status(405).end();
};

export default handler;
