import {
  editRecipe,
  getSingleRecipeWithoutCoverImageUrl,
} from "../../database/recipes";
import { DEFAULT_BUCKET_NAME, s3 } from "../../s3";
import type { Handler } from "../../utils/apiUtils";
import { RecipeNotFoundError } from "../../utils/errors";
import { IngredientUnit, RecipeVisibility } from "@prisma/client";
import { randomUUID } from "crypto";
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
  name: z.string().optional(),
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

    const originalRecipe = await getSingleRecipeWithoutCoverImageUrl(id);
    if (originalRecipe === null || originalRecipe.userId !== user.userId) {
      throw new RecipeNotFoundError(id);
    }

    const coverImageAction = body.coverImageAction;
    if (
      (coverImageAction === "remove" || coverImageAction === "replace") &&
      originalRecipe.coverImageName
    ) {
      await s3.removeObject(DEFAULT_BUCKET_NAME, originalRecipe.coverImageName);
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

    const edited = await editRecipe(id, body, coverImageNameForPrisma);

    return {
      recipe: edited,
      coverImageUploadUrl,
    };
  },
} satisfies Handler<z.infer<typeof editRecipeSchema>, { id: string }>;
