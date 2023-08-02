import { IngredientUnit, RecipeVisibility } from "@prisma/client";
import { z } from "zod";
import { AuthorizedUserRequestHandler } from "../../utils/apiUtils";
import { UUID, randomUUID } from "crypto";
import { DEFAULT_BUCKET_NAME, s3 } from "../../s3";
import { createRecipe } from "../../database/recipes";

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
export const visibilitySchema = z.nativeEnum(RecipeVisibility);
export const createRecipeSchema = z.object({
  name: z.string(),
  description: z.string(),
  ingredientSections: z.array(ingredientSectionSchema),
  instructions: z.array(instructionSchema),
  quantity: z.number().min(1),
  visibility: visibilitySchema,
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

export const recipesPostHandler = (async (user, body) => {
  let coverImageName: UUID | null = null;
  let coverImageUploadUrl: string | null = null;
  if (body.hasCoverImage) {
    coverImageName = randomUUID();
    coverImageUploadUrl = body.hasCoverImage
      ? await s3.presignedPutObject(DEFAULT_BUCKET_NAME, coverImageName) // TODO: Add checks on file size and type
      : null;
  }

  const recipe = await createRecipe(user.userId, body, coverImageName);

  return {
    recipe,
    coverImageUploadUrl,
  };
}) satisfies AuthorizedUserRequestHandler<z.infer<typeof createRecipeSchema>>;
