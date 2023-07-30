import { RecipeVisibility } from "@prisma/client";
import { prisma } from "../db";

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
