import { prisma } from "../db";

export const getLikeStatus = async (userId: string, recipeId: string) => {
  const like = await prisma.like.findFirst({
    where: {
      userId,
      recipeId,
    },
  });

  return like;
};

export const likeRecipe = async (userId: string, recipeId: string) => {
  const like = await prisma.like.create({
    data: {
      userId,
      recipeId,
    },
  });

  return like;
};

export const unlikeRecipe = async (userId: string, recipeId: string) => {
  const like = await prisma.like.deleteMany({
    where: {
      userId,
      recipeId,
    },
  });

  return like;
};

export const getLikeCountForRecipe = async (recipeId: string) => {
  const count = await prisma.like.count({
    where: {
      recipeId,
    },
  });

  return count;
};

