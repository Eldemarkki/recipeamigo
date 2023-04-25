import { NextApiHandler, NextApiRequest } from "next";
import { getUserFromRequest } from "../../../utils/auth";
import { createRecipe, getAllRecipesForUser } from "../../../database/recipes";
import z from "zod";
import { IngredientUnit } from "@prisma/client";
import formidable from "formidable";
import { S3 } from "@aws-sdk/client-s3";
import { createReadStream } from "fs";

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

export const createRecipeSchema = z.object({
  name: z.string(),
  description: z.string(),
  ingredientSections: z.array(ingredientSectionSchema),
  instructions: z.array(z.string()),
  quantity: z.number().min(1),
  isPublic: z.boolean(),
  timeEstimateMinimumMinutes: z.number().min(0).optional(),
  timeEstimateMaximumMinutes: z.number().min(0).optional()
});

export const config = {
  api: {
    bodyParser: false,
  }
};

const parseBodyAndUploadCoverImage = async (req: NextApiRequest, uploadFileName: string, userStatus: string): Promise<z.infer<typeof createRecipeSchema> & {
  coverImageUrl?: string
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

      const body = createRecipeSchema.safeParse(JSON.parse(fields.recipe));
      if (!body.success) {
        return reject(body.error);
      }

      // This is to prevent users without a profile from creating public recipes by calling
      // the API directly. It is required, because the frontend requires a username
      // to display on public recipes.
      if (body.data.isPublic && userStatus === "No profile") {
        return reject("You must have a profile to be able to create public recipes");
      }

      let coverImageUrl: string | undefined = undefined;
      if ("coverImage" in files) {
        const file = files.coverImage;
        if (Array.isArray(file)) {
          return reject("Cover image is not a single file");
        }

        const mime = file.mimetype;
        const extension = (mime ?? "image/png").split("/")[1];

        var fileStream = createReadStream(file.filepath);

        const s3 = new S3({
          endpoint: process.env.S3_ENDPOINT,
          credentials: {
            accessKeyId: process.env.S3_ACCESS_KEY_ID ?? "",
            secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? ""
          },
          region: "region", // This can be whatever, but it's required
          forcePathStyle: true,
        });

        const key = uploadFileName + "." + extension;
        await s3.putObject({
          Bucket: process.env.S3_BUCKET_NAME ?? "",
          Key: key,
          Body: fileStream,
          ACL: "public-read", // TODO: Check if this can be made more private
        });

        coverImageUrl = process.env.S3_ENDPOINT + "/" + process.env.S3_BUCKET_NAME + "/" + key;
      }

      resolve({
        ...body.data,
        coverImageUrl
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

    const filename = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const body = await parseBodyAndUploadCoverImage(req, filename, user.status);
    const recipe = await createRecipe(user.userId, body);
    return res.status(200).json(recipe);
  }

  return res.status(405).end();
};

export default handler;
