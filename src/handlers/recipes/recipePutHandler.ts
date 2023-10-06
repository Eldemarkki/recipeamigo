import config from "../../config";
import { editRecipe } from "../../database/recipes";
import { DEFAULT_BUCKET_NAME, s3 } from "../../s3";
import type { Handler } from "../../utils/apiUtils";
import { IngredientUnit, RecipeVisibility } from "@prisma/client";
import { randomUUID } from "crypto";
import type { PostPolicyResult } from "minio";
import { z } from "zod";

const newIngredientSchema = z.object({
  name: z.string(),
  quantity: z.number().nonnegative(),
  unit: z.nativeEnum(IngredientUnit).optional(),
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
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  ingredientSections: z.array(editingIngredientSchema).optional(),
  instructions: z.array(editingInstructionsSchema).optional(),
  quantity: z.number().min(1).optional(),
  visibility: z.nativeEnum(RecipeVisibility).optional(),
  timeEstimateMinimumMinutes: z.number().min(0).optional(),
  timeEstimateMaximumMinutes: z.number().min(0).optional(),
  tags: z
    .array(tagSchema)
    .refine((tags) => new Set(tags).size === tags.length, {
      message: "Tags must be unique",
    })
    .optional(),
  coverImageAction: z.union([
    z.literal("keep"),
    z.literal("remove"),
    z.literal("replace"),
  ]),
});

export const recipesPutHandler = {
  requireUser: true,
  bodyValidator: editRecipeSchema,
  queryValidator: z.object({
    id: z.string(),
  }),
  handler: async (user, body, query) => {
    const id = query.id;

    let coverImageUpload: PostPolicyResult | null = null;
    let coverImageNameForPrisma: string | null | undefined;
    const coverImageAction = body.coverImageAction;

    if (coverImageAction === "replace") {
      const newCoverImageName = randomUUID();
      const policy = s3.newPostPolicy();
      policy.setKey(newCoverImageName);
      policy.setBucket(DEFAULT_BUCKET_NAME);
      policy.setContentLengthRange(0, config.RECIPE_COVER_IMAGE_MAX_SIZE_BYTES);
      policy.setExpires(
        new Date(Date.now() + config.RECIPE_COVER_POST_POLICY_EXPIRATION),
      );
      coverImageUpload = await s3.presignedPostPolicy(policy);
      coverImageNameForPrisma = newCoverImageName;
    } else if (coverImageAction === "remove") {
      coverImageNameForPrisma = null;
    } else {
      coverImageNameForPrisma = undefined;
    }

    // TODO: Create a callback endpoint for when the upload has completed, and only then save the coverImageName into the database.
    // Now it's saved even if the upload fails. If the image doesn't exist when the recipe is viewed, it generates these errors:
    // `upstream image response failed for <url> 404`

    const edited = await editRecipe(
      user.userId,
      id,
      body,
      coverImageNameForPrisma,
    );

    if (
      (coverImageAction === "remove" || coverImageAction === "replace") &&
      edited.coverImageName
    ) {
      await s3.removeObject(DEFAULT_BUCKET_NAME, edited.coverImageName);
    }

    return {
      recipe: edited,
      coverImageUpload,
    };
  },
} satisfies Handler<z.infer<typeof editRecipeSchema>, { id: string }>;
