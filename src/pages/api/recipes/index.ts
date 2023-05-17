import { NextApiHandler, NextApiRequest } from "next";
import { getUserFromRequest } from "../../../utils/auth";
import { createRecipe, getAllRecipesForUser } from "../../../database/recipes";
import z from "zod";
import { IngredientUnit } from "@prisma/client";
import formidable from "formidable";
import { S3 } from "@aws-sdk/client-s3";
import { createReadStream } from "fs";
import { randomUUID } from "crypto";

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
  tags: z.array(tagSchema).refine((tags) => new Set(tags).size === tags.length, { message: "Tags must be unique" }).optional(),
});

export const config = {
  api: {
    bodyParser: false,
  }
};

const getBodyAndCoverImage = async (req: NextApiRequest): Promise<{
  body: unknown,
  file?: formidable.File,
}> => {
  return new Promise((resolve, reject) => {
    const form = new formidable.IncomingForm();
    form.parse(req, async (_err, fields, files) => {
      if (!("recipe" in fields)) {
        return reject("No recipe field in request");
      }

      if (typeof fields.recipe !== "string") {
        return reject("Recipe field is not a string");
      }

      const body = JSON.parse(fields.recipe);

      if ("coverImage" in files) {
        const file = files.coverImage;
        if (Array.isArray(file)) {
          return reject("Cover image is not a single file");
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
  if (req.method === "GET") {
    const user = await getUserFromRequest(req);
    if (user.status === "Unauthorized") {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const recipes = await getAllRecipesForUser(user.userId);

    return res.status(200).json(recipes);
  }
  else if (req.method === "POST") {
    const user = await getUserFromRequest(req);
    if (user.status === "Unauthorized") {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const { body, file } = await getBodyAndCoverImage(req);

    let coverImageUrl: string | undefined = undefined;
    if (file) {
      const s3 = new S3({
        endpoint: process.env.S3_ENDPOINT,
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID ?? "",
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? ""
        },
        region: "region", // This can be whatever, but it's required
        forcePathStyle: true,
      });

      const key = randomUUID();

      await s3.putObject({
        Bucket: process.env.S3_BUCKET_NAME ?? "",
        Key: key,
        Body: createReadStream(file.filepath),
        ACL: "public-read", // TODO: Check if this can be made more private
      });

      coverImageUrl = process.env.S3_ENDPOINT + "/" + process.env.S3_BUCKET_NAME + "/" + key;
    }

    const recipeBody = createRecipeSchema.safeParse(body);

    if (!recipeBody.success) {
      return res.status(400).json({ message: recipeBody.error });
    }

    const recipe = await createRecipe(user.userId, {
      ...recipeBody.data,
      coverImageUrl
    });
    return res.status(200).json(recipe);
  }

  return res.status(405).end();
};

export default handler;
