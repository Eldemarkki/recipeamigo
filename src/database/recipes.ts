import { z } from "zod";
import { prisma } from "../db";
import { createRecipeSchema } from "../pages/api/recipes";

export const getAllRecipesForUser = async (userId: string) => {
  const recipes = await prisma.recipe.findMany({
    where: {
      userId
    },
    include: {
      ingredientSections: {
        include: {
          ingredients: true
        }
      }
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
      quantity: recipe.quantity,
      isPublic: recipe.isPublic,
      userId,
      timeEstimateMinimumMinutes: recipe.timeEstimateMinimumMinutes,
      timeEstimateMaximumMinutes: recipe.timeEstimateMaximumMinutes, 
    }
  });

  await prisma.ingredientSection.createMany({
    data: recipe.ingredientSections.map(ingredientSection => ({
      name: ingredientSection.name,
      recipeId: createdRecipe.id
    })),
  });

  const ingredientSections = await prisma.ingredientSection.findMany({
    where: {
      recipeId: createdRecipe.id
    }
  });

  await prisma.ingredient.createMany({
    data: recipe.ingredientSections.flatMap((ingredientSection, index) => {
      return ingredientSection.ingredients.map(ingredient => ({
        name: ingredient.name,
        quantity: ingredient.quantity,
        unit: ingredient.unit,
        ingredientSectionId: ingredientSections[index].id
      }));
    }),
  });

  return await prisma.recipe.findUnique({
    where: {
      id: createdRecipe.id
    },
    include: {
      ingredientSections: {
        include: {
          ingredients: true
        }
      }
    }
  });
};

export const getSingleRecipe = async (id: string) => {
  const recipe = await prisma.recipe.findUnique({
    where: {
      id
    },
    include: {
      ingredientSections: {
        include: {
          ingredients: true
        }
      },
      user: true
    }
  });
  return recipe;
};

export const increaseViewCountForRecipe = async (id: string) => {
  const recipe = await prisma.recipe.findUnique({
    where: {
      id
    }
  });

  if (!recipe) {
    throw new Error("Recipe not found");
  }

  const updatedRecipe = await prisma.recipe.update({
    where: {
      id
    },
    data: {
      viewCount: recipe.viewCount + 1
    }
  });

  return updatedRecipe;
};
