import { z } from "zod";
import { createCollectionSchema } from "../pages/api/collections";
import { prisma } from "../db";
import { s3 } from "../s3";
import { hasReadAccessToRecipe } from "../utils/recipeUtils";

export const createCollection = async (
  userId: string,
  collection: z.infer<typeof createCollectionSchema>,
) => {
  const recipes = await prisma.recipe.findMany({
    where: {
      id: {
        in: collection.recipeIds,
      },
    },
  });

  const hasAccessToAll = recipes.every((recipe) =>
    hasReadAccessToRecipe(userId, recipe),
  );

  if (!hasAccessToAll || recipes.length !== collection.recipeIds.length) {
    throw new Error("User does not have access to all referenced recipes");
  }

  const newCollection = await prisma.recipeCollection.create({
    data: {
      userId,
      name: collection.name,
      visibility: collection.visibility,
      description: collection.description,
      RecipesOnCollections: {
        createMany: {
          data: collection.recipeIds.map((recipeId) => ({
            recipeId,
          })),
        },
      },
    },
  });

  return newCollection;
};

export const getCollection = async (id: string) => {
  const collection = await prisma.recipeCollection.findUnique({
    where: {
      id,
    },
    include: {
      RecipesOnCollections: {
        include: {
          recipe: true,
        },
      },
    },
  });

  if (!collection) {
    return null;
  }

  const recipesWithCoverImageUrls = await Promise.all(
    collection.RecipesOnCollections.map((roc) => roc.recipe).map(
      async (recipe) => {
        return {
          ...recipe,
          coverImageUrl: recipe.coverImageName
            ? await s3.presignedGetObject(
                process.env.S3_BUCKET_NAME ?? "",
                recipe?.coverImageName,
              )
            : undefined,
        };
      },
    ),
  );

  return {
    ...collection,
    RecipesOnCollections: recipesWithCoverImageUrls.map((recipe, index) => ({
      ...collection.RecipesOnCollections[index],
      recipe,
    })),
  };
};

export const getUserCollections = async (userId: string) => {
  return await prisma.recipeCollection.findMany({
    where: {
      userId,
    },
    include: {
      _count: {
        select: {
          RecipesOnCollections: true,
        },
      },
      user: {
        select: {
          username: true,
        },
      },
    },
  });
};

export const getPublicCollections = async () => {
  return await prisma.recipeCollection.findMany({
    where: {
      visibility: "PUBLIC",
    },
    include: {
      _count: {
        select: {
          RecipesOnCollections: true,
        },
      },
      user: true,
    },
  });
};
