import { prisma } from "../db";
import { RecipeVisibility } from "@prisma/client";

export const getUserAndPublicRecipesByUsername = (username: string) => {
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
    },
  });
};
