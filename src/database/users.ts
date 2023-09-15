import { prisma } from "../db";
import { RecipeVisibility } from "@prisma/client";

export const getUserAndPublicRecipesAndPublicCollectionsByUsername = (
  username: string,
) => {
  return prisma.userProfile.findUnique({
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
};
