import { z } from "zod";
import { prisma } from "../db";
import { createRecipeSchema } from "../pages/api/recipes";

export const getAllRecipesForUser = async (userId: string) => {
  const recipes = await prisma.recipe.findMany({
    where: {
      userId
    },
    include: {
      ingredients: true
    }
  });
  return recipes;
};

export const createRecipe = async (userId: string, recipe: z.infer<typeof createRecipeSchema>) => {
  const createdRecipe = await prisma.recipe.create({
    data: {
      name: recipe.name,
      description: recipe.description,
      instructions: recipe.instructions,
      userId,
    }
  });

  await prisma.ingredient.createMany({
    data: recipe.ingredients.map(ingredient => ({
      ...ingredient,
      recipeId: createdRecipe.id
    })),
  });

  return await prisma.recipe.findUnique({
    where: {
      id: createdRecipe.id
    },
    include: {
      ingredients: true
    }
  });
};

export const getSingleRecipe = async (id: string) => {
  const recipe = await prisma.recipe.findUnique({
    where: {
      id
    },
    include: {
      ingredients: true
    }
  });
  return recipe;
};
