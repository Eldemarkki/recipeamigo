import { z } from "zod";
import { prisma } from "../db";
import { createRecipeSchema } from "../pages/api/recipes";
import { editRecipeSchema } from "../pages/api/recipes/[id]";

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
  return await prisma.$transaction(async (prisma) => {
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
      data: recipe.ingredientSections.map((ingredientSection, index) => ({
        name: ingredientSection.name,
        recipeId: createdRecipe.id,
        order: index
      })),
    });

    const ingredientSections = await prisma.ingredientSection.findMany({
      where: {
        recipeId: createdRecipe.id
      }
    });

    await prisma.ingredient.createMany({
      data: recipe.ingredientSections.flatMap((ingredientSection, ingredientSectionIndex) => {
        return ingredientSection.ingredients.map((ingredient, ingredientIndex) => ({
          name: ingredient.name,
          quantity: ingredient.quantity,
          unit: ingredient.unit,
          isOptional: ingredient.isOptional,
          ingredientSectionId: ingredientSections[ingredientSectionIndex].id,
          order: ingredientIndex
        }));
      }),
    });

    const recipeWithIngredients = await prisma.recipe.findUnique({
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

    if (!recipeWithIngredients) throw new Error("Recipe not found after creation. This should never happen.");

    return recipeWithIngredients;
  });
};

export const editRecipe = async (recipeId: string, editedRecipe: z.infer<typeof editRecipeSchema>) => {
  return await prisma.$transaction(async (prisma) => {
    const originalRecipe = await prisma.recipe.findUnique({
      where: {
        id: recipeId
      },
      include: {
        ingredientSections: {
          include: {
            ingredients: true
          }
        }
      }
    });

    if (!originalRecipe) {
      throw new Error("Recipe not found");
    }

    const ingredientSectionIds = (editedRecipe.ingredientSections ?? [])
      .map(ingredientSection => "id" in ingredientSection ? ingredientSection.id : undefined)
      .filter((id): id is string => id !== undefined);

    const ingredientSections = await prisma.ingredientSection.findMany({
      where: {
        id: {
          in: ingredientSectionIds
        }
      }
    });
    const hasAccessToAllIngredientSections = ingredientSections.every(ingredientSection => ingredientSection.recipeId === recipeId);
    if (!hasAccessToAllIngredientSections) {
      throw new Error("Can not move ingredient section to another recipe");
    }

    const ingredientIds = (editedRecipe.ingredientSections ?? [])
      .flatMap(ingredientSection => ingredientSection.ingredients)
      .map(ingredient => (ingredient && "id" in ingredient) ? ingredient.id : undefined)
      .filter((id): id is string => id !== undefined);

    const ingredients = await prisma.ingredient.findMany({
      where: {
        id: {
          in: ingredientIds
        }
      },
      select: {
        ingredientSection: {
          select: {
            recipeId: true
          }
        }
      }
    });

    const hasAccessToAllIngredients = ingredients.every(ingredient => ingredient.ingredientSection.recipeId === recipeId);
    if (!hasAccessToAllIngredients) {
      throw new Error("Can not move ingredient to another recipe");
    }

    // edit basic fields of recipe
    await prisma.recipe.update({
      where: {
        id: recipeId
      },
      data: {
        name: editedRecipe.name,
        description: editedRecipe.description,
        instructions: editedRecipe.instructions,
        quantity: editedRecipe.quantity,
        isPublic: editedRecipe.isPublic,
        timeEstimateMinimumMinutes: editedRecipe.timeEstimateMinimumMinutes,
        timeEstimateMaximumMinutes: editedRecipe.timeEstimateMaximumMinutes,
      }
    });

    if (editedRecipe.ingredientSections) {
      // Delete any ingredients that were removed
      const ingredientsToRemove = originalRecipe.ingredientSections.flatMap(originalIngredientSection => {
        return originalIngredientSection.ingredients.filter(originalIngredient => {
          return !editedRecipe.ingredientSections?.some(ingredientSection =>
            "id" in ingredientSection
            && ingredientSection.id === originalIngredientSection.id
            && ingredientSection.ingredients?.some(ingredient => "id" in ingredient && ingredient.id === originalIngredient.id));
        });
      });

      await prisma.ingredient.deleteMany({
        where: {
          id: {
            in: ingredientsToRemove.map(ingredient => ingredient.id)
          },
          ingredientSection: {
            recipe: {
              userId: originalRecipe.userId
            }
          }
        }
      });

      // Delete any ingredient sections that were removed
      const ingredientSectionsToRemove = originalRecipe.ingredientSections.filter(originalIngredientSection => {
        return !editedRecipe.ingredientSections?.some(ingredientSection => "id" in ingredientSection && ingredientSection.id === originalIngredientSection.id);
      });

      await prisma.ingredientSection.deleteMany({
        where: {
          id: {
            in: ingredientSectionsToRemove.map(ingredientSection => ingredientSection.id)
          },
          recipe: {
            userId: originalRecipe.userId
          }
        }
      });

      // make all orders negative to allow the them to be changed correctly
      for (let i = 0; i < editedRecipe.ingredientSections.length; i++) {
        const ingredientSection = editedRecipe.ingredientSections[i];
        if ("id" in ingredientSection) {
          await prisma.ingredientSection.update({
            where: {
              id: ingredientSection.id
            },
            data: {
              order: -i
            }
          });
        }
      }

      for (let i = 0; i < ingredientIds.length; i++) {
        const ingredientId = ingredientIds[i];

        await prisma.ingredient.update({
          where: {
            id: ingredientId
          },
          data: {
            order: -i
          }
        });
      }

      for (let ingredientSectionIndex = 0; ingredientSectionIndex < editedRecipe.ingredientSections.length; ingredientSectionIndex++) {
        const ingredientSection = editedRecipe.ingredientSections[ingredientSectionIndex];

        if ("id" in ingredientSection) {
          // This should be updated
          await prisma.ingredientSection.update({
            where: {
              id: ingredientSection.id
            },
            data: {
              name: ingredientSection.name,
            }
          });

          if (ingredientSection.ingredients !== undefined) {
            for (let ingredientIndex = 0; ingredientIndex < ingredientSection.ingredients.length; ingredientIndex++) {
              const ingredient = ingredientSection.ingredients[ingredientIndex];
              if ("id" in ingredient) {
                // This should be updated
                await prisma.ingredient.update({
                  where: {
                    id: ingredient.id
                  },
                  data: {
                    name: ingredient.name,
                    quantity: ingredient.quantity,
                    unit: ingredient.unit,
                    isOptional: ingredient.isOptional,
                    order: ingredientIndex
                  }
                });
              }
              else {
                // This should be created
                const newIng = await prisma.ingredient.create({
                  data: {
                    name: ingredient.name,
                    quantity: ingredient.quantity,
                    unit: ingredient.unit,
                    isOptional: ingredient.isOptional,
                    ingredientSectionId: ingredientSection.id,
                    order: ingredientIndex
                  }
                });
              }
            };
          }
        }
        else {
          // This should be created
          const createdIngredientSection = await prisma.ingredientSection.create({
            data: {
              name: ingredientSection.name,
              recipeId,
              order: ingredientSectionIndex
            }
          });

          for (let ingredientIndex = 0; ingredientIndex < ingredientSection.ingredients.length; ingredientIndex++) {
            const ingredient = ingredientSection.ingredients[ingredientIndex];
            if ("id" in ingredient) {
              // This should be updated
              await prisma.ingredient.update({
                where: {
                  id: ingredient.id
                },
                data: {
                  name: ingredient.name,
                  quantity: ingredient.quantity,
                  unit: ingredient.unit,
                  isOptional: ingredient.isOptional,
                  ingredientSectionId: createdIngredientSection.id,
                  order: ingredientIndex
                }
              });
            }
            else {
              // This should be created
              await prisma.ingredient.create({
                data: {
                  name: ingredient.name,
                  quantity: ingredient.quantity,
                  unit: ingredient.unit,
                  isOptional: ingredient.isOptional,
                  ingredientSectionId: createdIngredientSection.id,
                  order: ingredientIndex
                }
              });
            }
          };
        }
      };
    }

    const result = await prisma.recipe.findUnique({
      where: {
        id: recipeId
      },
      include: {
        ingredientSections: {
          include: {
            ingredients: true
          }
        }
      }
    });

    if (!result) {
      throw new Error("Recipe not found after editing. This should never happen");
    }

    return result;
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
