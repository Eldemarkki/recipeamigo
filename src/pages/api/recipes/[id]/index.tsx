import { z } from "zod";
import {
  ingredientUnitSchema,
  visibilitySchema,
} from "../../../../handlers/recipes/recipesPostHandler";
import { NextApiHandler } from "next";
import { getUserFromRequest } from "../../../../utils/auth";
import {
  editRecipe,
  getSingleRecipeWithoutCoverImageUrl,
} from "../../../../database/recipes";
import { randomUUID } from "crypto";
import { DEFAULT_BUCKET_NAME, s3 } from "../../../../s3";

const newIngredientSchema = z.object({
  name: z.string(),
  quantity: z.number().nonnegative(),
  unit: ingredientUnitSchema.optional(),
  isOptional: z.boolean().optional(),
});

const editIngredientSchema = newIngredientSchema
  .partial()
  .and(z.object({ id: z.string().uuid() }));

const newIngredientSectionsSchema = z.array(
  editIngredientSchema.or(newIngredientSchema),
);
const editIngredientSectionsSchema = z.array(
  editIngredientSchema.or(newIngredientSchema),
);

const editingIngredientSchema = z
  .object({
    id: z.string().uuid(),
    name: z.string().optional(),
    ingredients: editIngredientSectionsSchema.optional(),
  })
  .or(
    z.object({
      name: z.string(),
      ingredients: newIngredientSectionsSchema,
    }),
  );

const editingInstructionsSchema = z
  .object({
    id: z.string().uuid(),
    description: z.string(),
  })
  .or(
    z.object({
      description: z.string(),
    }),
  );

const tagSchema = z
  .object({
    id: z.string().uuid(),
    text: z.string(),
  })
  .or(
    z.object({
      text: z.string(),
    }),
  );

export const editRecipeSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  ingredientSections: z.array(editingIngredientSchema).optional(),
  instructions: z.array(editingInstructionsSchema).optional(),
  quantity: z.number().min(1).optional(),
  visibility: visibilitySchema.optional(),
  timeEstimateMinimumMinutes: z.number().min(0).optional(),
  timeEstimateMaximumMinutes: z.number().min(0).optional(),
  tags: z
    .array(tagSchema)
    .refine((tags) => new Set(tags).size === tags.length, {
      message: "Tags must be unique",
    })
    .optional(),
  coverImageAction: z
    .union([z.literal("keep"), z.literal("remove"), z.literal("replace")])
    .optional()
    .default("keep"),
});

const allowedErrors = {
  noRecipeField: "No recipe field in request",
  recipeNotString: "Recipe field is not a string",
  coverImageNotSingleFile: "Cover image is not a single file",
} as const;

type AllowedErrorKey = keyof typeof allowedErrors;
type AllowedErrorValue = (typeof allowedErrors)[AllowedErrorKey];

const allowedErrorValues = Object.values(allowedErrors) as AllowedErrorValue[];

const handler = (async (req, res) => {
  if (req.method === "PUT") {
    const id = req.query.id;
    if (typeof id !== "string") {
      throw new Error("Recipe id is not a string. This should never happen.");
    }

    const user = await getUserFromRequest(req);
    if (user.status !== "OK") {
      return res.status(401).end();
    }

    const originalRecipe = await getSingleRecipeWithoutCoverImageUrl(id);
    if (originalRecipe === null || originalRecipe.userId !== user.userId) {
      return res.status(404).end();
    }

    try {
      const recipeParsed = editRecipeSchema.safeParse(req.body);

      if (!recipeParsed.success) {
        return res.status(400).json({ error: recipeParsed.error });
      }

      const coverImageAction = recipeParsed.data.coverImageAction;
      if (
        (coverImageAction === "remove" || coverImageAction === "replace") &&
        originalRecipe.coverImageName
      ) {
        await s3.removeObject(
          DEFAULT_BUCKET_NAME,
          originalRecipe.coverImageName,
        );
      }

      let coverImageUploadUrl: string | undefined = undefined;
      const newCoverImageName = randomUUID();
      if (coverImageAction === "replace") {
        // TODO: Add checks on file size and type
        coverImageUploadUrl = await s3.presignedPutObject(
          DEFAULT_BUCKET_NAME,
          newCoverImageName,
        );
      }

      const coverImageNameForPrisma = {
        keep: undefined,
        remove: null,
        replace: newCoverImageName,
      }[coverImageAction];
      const edited = await editRecipe(
        id,
        recipeParsed.data,
        coverImageNameForPrisma,
      );

      return res.status(200).json({
        recipe: edited,
        coverImageUploadUrl,
      });
    } catch (e) {
      if (typeof e === "string" && allowedErrorValues.includes(e as any)) {
        return res.status(400).json({ error: e });
      }

      console.error(e);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  return res.status(405).end();
}) satisfies NextApiHandler;

export default handler;
