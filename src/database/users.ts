import { prisma } from "../db";
import { DEFAULT_BUCKET_NAME, s3 } from "../s3";
import { RecipeVisibility } from "@prisma/client";

export const getUserAndPublicRecipesAndPublicCollectionsByUsername = async (
  username: string,
) => {
  const profile = await prisma.userProfile.findUnique({
    where: {
      username,
    },
    include: {
      recipes: {
        where: {
          visibility: RecipeVisibility.PUBLIC,
        },
      },
      recipeCollections: {
        where: {
          visibility: RecipeVisibility.PUBLIC,
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
      },
    },
  });

  if (!profile) {
    return null;
  }

  const recipesWithCoverImageUrls = await Promise.all(
    profile.recipes.map(async (recipe) => ({
      ...recipe,
      coverImageUrl: recipe.coverImageName
        ? await s3.presignedGetObject(
            DEFAULT_BUCKET_NAME,
            recipe.coverImageName,
          )
        : undefined,
    })),
  );

  return {
    ...profile,
    recipes: recipesWithCoverImageUrls,
  };
};
