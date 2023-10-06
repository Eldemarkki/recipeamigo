import config from "../../config";
import { createRecipe } from "../../database/recipes";
import { DEFAULT_BUCKET_NAME, s3 } from "../../s3";
import type { Handler } from "../../utils/apiUtils";
import { IngredientUnit, RecipeVisibility } from "@prisma/client";
import type { UUID } from "crypto";
import { randomUUID } from "crypto";
import type { PostPolicyResult } from "minio";
import { z } from "zod";

export const ingredientSchema = z.object({
  name: z.string().min(1),
  quantity: z.number().nonnegative(),
  unit: z.nativeEnum(IngredientUnit).optional(),
  isOptional: z.boolean().optional(),
});
export const ingredientSectionSchema = z.object({
  name: z.string().min(1),
  ingredients: z.array(ingredientSchema),
});
export const instructionSchema = z.object({
  description: z.string(),
});
export const tagSchema = z.string().min(1);
export const createRecipeSchema = z.object({
  name: z.string().min(1),
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
    let coverImageUpload: PostPolicyResult | null = null;
    if (body.hasCoverImage) {
      coverImageName = randomUUID();

      const policy = s3.newPostPolicy();
      policy.setKey(coverImageName);
      policy.setBucket(DEFAULT_BUCKET_NAME);
      policy.setContentLengthRange(0, config.RECIPE_COVER_IMAGE_MAX_SIZE_BYTES);
      policy.setExpires(
        new Date(Date.now() + config.RECIPE_COVER_POST_POLICY_EXPIRATION),
      );

      coverImageUpload = await s3.presignedPostPolicy(policy);
    }

    // TODO: Create a callback endpoint for when the upload has completed, and only then save the coverImageName into the database.
    // Now it's saved even if the upload fails. If the image doesn't exist when the recipe is viewed, it generates these errors:
    // `upstream image response failed for <url> 404`

    const recipe = await createRecipe(user.userId, body, coverImageName);

    return {
      recipe,
      coverImageUpload,
    };
  },
} satisfies Handler<z.infer<typeof createRecipeSchema>>;
