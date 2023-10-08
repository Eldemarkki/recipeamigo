import { prisma } from "../db";
import type { editCollectionSchema } from "../handlers/collections/collectionsIdPutHandler";
import type { createCollectionSchema } from "../handlers/collections/collectionsPostHandler";
import { s3 } from "../s3";
import {
  hasWriteAccessToCollection,
  isValidVisibilityConfiguration,
} from "../utils/collectionUtils";
import {
  BadRequestError,
  CollectionNotFoundError,
  ErrorCode,
  RecipesMustBePublicError,
  RecipesMustBePublicOrUnlistedError,
  RecipesNotFoundError,
} from "../utils/errors";
import { hasReadAccessToRecipe } from "../utils/recipeUtils";
import { RecipeCollectionVisibility, RecipeVisibility } from "@prisma/client";
import type { z } from "zod";

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
    const missingIds = collection.recipeIds.filter((id) => {
      const recipe = recipes.find((r) => r.id === id);
      return !recipe || !hasReadAccessToRecipe(userId, recipe);
    });

    throw new RecipesNotFoundError(missingIds);
  }

  const validityConfiguration = isValidVisibilityConfiguration(
    collection.visibility,
    recipes,
  );

  if (!validityConfiguration.isValid) {
    const violations = validityConfiguration.violatingRecipes.map((r) => r.id);
    if (collection.visibility === RecipeCollectionVisibility.PUBLIC) {
      throw new RecipesMustBePublicError(violations);
    } else if (collection.visibility === RecipeCollectionVisibility.UNLISTED) {
      throw new RecipesMustBePublicOrUnlistedError(violations);
    }

    // This should never happen
    throw new BadRequestError(
      ErrorCode.BadRequest,
      "Invalid visibility configuration. The following recipe ids are in violation: " +
        violations.join(", "),
    );
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

export const getCollectionWithoutCoverImages = async (id: string) => {
  const collection = await prisma.recipeCollection.findUnique({
    where: {
      id,
    },
    include: {
      RecipesOnCollections: {
        include: {
          recipe: {
            include: {
              _count: {
                select: {
                  likes: true,
                },
              },
            },
          },
        },
      },
      user: {
        select: {
          username: true,
        },
      },
    },
  });

  return collection;
};

export const getCollection = async (id: string) => {
  const collection = await getCollectionWithoutCoverImages(id);

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
                recipe.coverImageName,
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
      visibility: RecipeCollectionVisibility.PUBLIC,
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

export const editCollection = async (
  userId: string,
  collectionId: string,
  collection: z.infer<typeof editCollectionSchema>,
) => {
  const [requestedRecipes, collectionToUpdate] = await Promise.all([
    prisma.recipe.findMany({
      where: {
        id: {
          in: collection.recipeIds,
        },
      },
    }),
    prisma.recipeCollection.findUnique({
      where: {
        id: collectionId,
      },
      include: {
        RecipesOnCollections: {
          include: {
            recipe: true,
          },
        },
      },
    }),
  ]);

  if (
    !collectionToUpdate ||
    !hasWriteAccessToCollection(userId, collectionToUpdate)
  ) {
    throw new CollectionNotFoundError(collectionId);
  }

  const hasAccessToAll = requestedRecipes.every((recipe) =>
    hasReadAccessToRecipe(userId, recipe),
  );

  if (
    !hasAccessToAll ||
    requestedRecipes.length !== collection.recipeIds.length
  ) {
    const missingIds = collection.recipeIds.filter((id) => {
      const recipe = requestedRecipes.find((r) => r.id === id);
      return !recipe || !hasReadAccessToRecipe(userId, recipe);
    });

    throw new RecipesNotFoundError(missingIds);
  }

  const configurationValidity = isValidVisibilityConfiguration(
    collection.visibility,
    requestedRecipes,
  );
  if (!configurationValidity.isValid) {
    const violations = configurationValidity.violatingRecipes.map((r) => r.id);
    if (collection.visibility === RecipeCollectionVisibility.PUBLIC) {
      throw new RecipesMustBePublicError(violations);
    } else if (collection.visibility === RecipeCollectionVisibility.UNLISTED) {
      throw new RecipesMustBePublicOrUnlistedError(violations);
    }

    // This should never happen
    throw new Error(
      "Invalid visibility configuration. The following recipe ids are in violation: " +
        violations.join(", "),
    );
  }

  const editedCollection = await prisma.recipeCollection.update({
    where: {
      id: collectionId,
    },
    data: {
      name: collection.name,
      visibility: collection.visibility,
      description: collection.description,
      RecipesOnCollections: {
        deleteMany: {
          recipeId: {
            notIn: collection.recipeIds,
          },
        },
        createMany: {
          data: collection.recipeIds
            .filter(
              (recipeId) =>
                !collectionToUpdate.RecipesOnCollections.some(
                  (roc) => roc.recipeId === recipeId,
                ),
            )
            .map((recipeId) => ({
              recipeId,
            })),
        },
      },
    },
  });

  return editedCollection;
};

export const getUserCollectionsWithMaximumVisibility = async (
  userId: string,
  recipeVisibility: RecipeVisibility,
) => {
  const allowedCollectionVisibilities = {
    [RecipeVisibility.PUBLIC]: [
      RecipeCollectionVisibility.PUBLIC,
      RecipeCollectionVisibility.UNLISTED,
      RecipeCollectionVisibility.PRIVATE,
    ],
    [RecipeVisibility.UNLISTED]: [
      RecipeCollectionVisibility.UNLISTED,
      RecipeCollectionVisibility.PRIVATE,
    ],
    [RecipeVisibility.PRIVATE]: [RecipeCollectionVisibility.PRIVATE],
  }[recipeVisibility];

  return await prisma.recipeCollection.findMany({
    where: {
      userId,
      visibility: {
        in: allowedCollectionVisibilities,
      },
    },
  });
};

export const setRecipeToRecipeCollectionRelationships = async (
  recipeId: string,
  userId: string,
  collectionIds: string[],
) => {
  await prisma.recipesOnCollections.deleteMany({
    where: {
      recipeId,
      recipeCollection: {
        userId,
      },
      recipeCollectionId: {
        notIn: collectionIds,
      },
    },
  });

  await prisma.recipesOnCollections.createMany({
    data: collectionIds.map((collectionId) => ({
      recipeId,
      recipeCollectionId: collectionId,
    })),
    skipDuplicates: true,
  });
};

export const getUserRecipeCollectionRelationships = async (
  recipeId: string,
  userId: string,
) => {
  return await prisma.recipesOnCollections.findMany({
    where: {
      recipeId,
      recipeCollection: {
        userId,
      },
    },
    include: {
      recipeCollection: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
};

export const deleteCollection = async (collectionId: string) => {
  await prisma.recipeCollection.delete({
    where: {
      id: collectionId,
    },
  });
};
