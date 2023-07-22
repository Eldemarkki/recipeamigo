import { prisma } from "../db";

export const getUserAndPublicRecipesByUsername = (username: string) => {
  return prisma.userProfile.findUnique({
    where: {
      username,
    },
    include: {
      recipes: {
        where: {
          isPublic: true,
        },
      },
    },
  });
};
