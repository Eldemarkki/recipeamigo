import { NextApiHandler } from "next";
import { getUserFromRequest } from "../../../utils/auth";
import { createRecipe, getAllRecipesForUser } from "../../../database/recipes";
import z from "zod";
import { IngredientUnit } from "@prisma/client";
import { UUID, randomUUID } from "crypto";
import { DEFAULT_BUCKET_NAME, s3 } from "../../../s3";
import { calculateTime } from "../../../utils/api/timing";

export const ingredientUnitSchema = z.nativeEnum(IngredientUnit);

export const ingredientSchema = z.object({
  name: z.string(),
  quantity: z.number().nonnegative(),
  unit: ingredientUnitSchema.optional(),
  isOptional: z.boolean().optional(),
});

export const ingredientSectionSchema = z.object({
  name: z.string(),
  ingredients: z.array(ingredientSchema),
});

export const instructionSchema = z.object({
  description: z.string(),
});

export const tagSchema = z.string().min(1);

export const createRecipeSchema = z.object({
  name: z.string(),
  description: z.string(),
  ingredientSections: z.array(ingredientSectionSchema),
  instructions: z.array(instructionSchema),
  quantity: z.number().min(1),
  isPublic: z.boolean(),
  timeEstimateMinimumMinutes: z.number().min(0).optional(),
  timeEstimateMaximumMinutes: z.number().min(0).optional(),
  tags: z
    .array(tagSchema)
    .refine((tags) => new Set(tags).size === tags.length, {
      message: "Tags must be unique",
    })
    .optional(),
  hasCoverImage: z.boolean().optional(),
});

const handler = (async (req, res) => {
  if (req.method === "GET") {
    const user = await getUserFromRequest(req);
    if (user.status === "Unauthorized") {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const recipes = await getAllRecipesForUser(user.userId);

    return res.status(200).json(recipes);
  } else if (req.method === "POST") {
    const user = await calculateTime("userVerify", res, () =>
      getUserFromRequest(req),
    );

    if (user.status === "Unauthorized") {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const recipeBody = createRecipeSchema.safeParse(req.body);

    if (!recipeBody.success) {
      return res.status(400).json({ message: recipeBody.error });
    }

    let coverImageName: UUID | null = null;
    let coverImageUploadUrl: string | null = null;
    if (recipeBody.data.hasCoverImage) {
      coverImageName = randomUUID();
      coverImageUploadUrl = recipeBody.data.hasCoverImage
        ? await s3.presignedPutObject(DEFAULT_BUCKET_NAME, coverImageName) // TODO: Add checks on file size and type
        : null;
    }

    const recipe = await calculateTime("createRecipe", res, () =>
      createRecipe(user.userId, recipeBody.data, coverImageName),
    );

    return res.status(200).json({
      recipe,
      coverImageUploadUrl,
    });
  }

  return res.status(405).end();
}) satisfies NextApiHandler;

export default handler;
