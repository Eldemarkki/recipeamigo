import { createRecipe } from "../../database/recipes";
import { DEFAULT_BUCKET_NAME, s3 } from "../../s3";
import { Handler } from "../../utils/apiUtils";
import { IngredientUnit, RecipeVisibility } from "@prisma/client";
import { UUID, randomUUID } from "crypto";
import { z } from "zod";

export const ingredientSchema = z.object({
  name: z.string(),
  quantity: z.number().nonnegative(),
  unit: z.nativeEnum(IngredientUnit).optional(),
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
  visibility: z.nativeEnum(RecipeVisibility),
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

export const recipesPostHandler = {
  requireUser: true,
  bodyValidator: createRecipeSchema,
  handler: async (user, body) => {
    let coverImageName: UUID | null = null;
    let coverImageUploadUrl: string | null = null;
    if (body.hasCoverImage) {
      coverImageName = randomUUID();
      // TODO: Add checks on file size and type
      coverImageUploadUrl = await s3.presignedPutObject(
        DEFAULT_BUCKET_NAME,
        coverImageName,
      );
    }

    const recipe = await createRecipe(user.userId, body, coverImageName);

    return {
      recipe,
      coverImageUploadUrl,
    };
  },
} satisfies Handler<z.infer<typeof createRecipeSchema>>;
