import { prisma } from "../db";

export const getAllRecipesForUser = async (userId: string) => {
  const recipes = await prisma.recipe.findMany({
    where: {
      userId
    }
  });
  return recipes;
};



export const createRecipe = async (userId: string, recipe: {
  name: string;
  description: string;
}) => {
  const createdRecipe = await prisma.recipe.create({
    data: {
      ...recipe,
      userId,
    }
  });

  return createdRecipe;
};
