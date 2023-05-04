import { z } from "zod";
import { ingredientUnitSchema } from "..";
import { NextApiHandler, NextApiRequest } from "next";
import { getUserFromRequest } from "../../../../utils/auth";
import { editRecipe, getSingleRecipe } from "../../../../database/recipes";
import formidable from "formidable";
import { S3 } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import { createReadStream } from "fs";

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

const editingInstructionsSchema = z.object({
  id: z.string().uuid(),
  description: z.string()
}).strict().or(z.object({
  description: z.string()
}).strict());

export const editRecipeSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  ingredientSections: z.array(editingIngredientSchema).optional(),
  instructions: z.array(editingInstructionsSchema).optional(),
  quantity: z.number().min(1).optional(),
  isPublic: z.boolean().optional(),
  timeEstimateMinimumMinutes: z.number().min(0).optional(),
  timeEstimateMaximumMinutes: z.number().min(0).optional(),
  shouldDeleteCoverImage: z.boolean().optional(),
}).strict();

export const config = {
  api: {
    bodyParser: false,
  }
};

const allowedErrors = {
  noRecipeField: "No recipe field in request",
  recipeNotString: "Recipe field is not a string",
  coverImageNotSingleFile: "Cover image is not a single file",
} as const;

type AllowedErrorKey = keyof typeof allowedErrors;
type AllowedErrorValue = typeof allowedErrors[AllowedErrorKey];

const allowedErrorValues = Object.values(allowedErrors) as AllowedErrorValue[];

const getBodyAndCoverImage = async (req: NextApiRequest): Promise<{
  body: unknown,
  file?: formidable.File,
}> => {
  return new Promise((resolve, reject) => {
    const form = new formidable.IncomingForm();
    form.parse(req, async (_err, fields, files) => {
      if (!("recipe" in fields)) {
        return reject(allowedErrors.noRecipeField);
      }

      if (typeof fields.recipe !== "string") {
        return reject(allowedErrors.recipeNotString);
      }

      const body = JSON.parse(fields.recipe);

      if ("coverImage" in files) {
        const file = files.coverImage;
        if (Array.isArray(file)) {
          return reject(allowedErrors.coverImageNotSingleFile);
        }

        resolve({
          body,
          file,
        });
      }

      resolve({
        body
      });
    });
  });
};


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

    try {
      const { body, file } = await getBodyAndCoverImage(req);

      const recipeParsed = editRecipeSchema.safeParse(body);

      const s3 = new S3({
        endpoint: process.env.S3_ENDPOINT,
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID ?? "",
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? ""
        },
        region: "region", // This can be whatever, but it's required
        forcePathStyle: true,
      });

      const originalCoverImageKey = originalRecipe.coverImageUrl?.split("/").pop();
      const shouldDeleteOld = file || (recipeParsed.success && recipeParsed.data.shouldDeleteCoverImage);

      if (shouldDeleteOld && originalCoverImageKey) {
        await s3.deleteObject({
          Bucket: process.env.S3_BUCKET_NAME ?? "",
          Key: originalCoverImageKey,
        });
      }

      let coverImageUrl: string | undefined = undefined;
      if (file) {
        const key = randomUUID();

        await s3.putObject({
          Bucket: process.env.S3_BUCKET_NAME ?? "",
          Key: key,
          Body: createReadStream(file.filepath),
          ACL: "public-read", // TODO: Check if this can be made more private
        });

        coverImageUrl = process.env.S3_ENDPOINT + "/" + process.env.S3_BUCKET_NAME + "/" + key;
      }

      if (recipeParsed.success) {
        const edited = await editRecipe(id, {
          ...recipeParsed.data,
          coverImageUrl: coverImageUrl ?? (shouldDeleteOld ? null : undefined)
        });

        return res.status(200).json(edited);
      }
      else {
        return res.status(400).json({ error: recipeParsed.error });
      }
    }
    catch (e) {
      if (typeof e === "string" && allowedErrorValues.includes(e as any)) {
        return res.status(400).json({ error: e });
      }

      return res.status(500).json({ error: "Internal server error" });
    }
  }

  return res.status(405).end();
};

export default handler;
