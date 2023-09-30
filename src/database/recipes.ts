import type {
  SortColumn,
  SortDirection,
  SortKey,
} from "../components/browse/sort/BrowseSort";
import { prisma } from "../db";
import type { editRecipeSchema } from "../handlers/recipes/recipePutHandler";
import type { createRecipeSchema } from "../handlers/recipes/recipesPostHandler";
import { DEFAULT_BUCKET_NAME, s3 } from "../s3";
import { notNull } from "../utils/arrayUtils";
import { getValidCollectionVisibilitiesForRecipeVisibility } from "../utils/collectionUtils";
import { RecipeVisibility } from "@prisma/client";
import type { UUID } from "crypto";
import type { z } from "zod";

export const getAllRecipesForUser = async (userId: string) => {
  const recipes = await prisma.recipe.findMany({
    where: {
      userId,
    },
    include: {
      ingredientSections: {
        include: {
          ingredients: {
            orderBy: {
              order: "asc",
            },
          },
        },
        orderBy: {
          order: "asc",
        },
      },
      instructions: {
        orderBy: {
          order: "asc",
        },
      },
      tags: {
        orderBy: {
          order: "asc",
        },
      },
    },
  });

  const recipesWithCoverImageUrls = await Promise.all(
    recipes.map(async (recipe) => {
      const coverImageUrl = recipe.coverImageName
        ? await s3.presignedGetObject(
            DEFAULT_BUCKET_NAME,
            recipe.coverImageName,
          )
        : undefined;

      return {
        ...recipe,
        coverImageUrl,
      };
    }),
  );

  return recipesWithCoverImageUrls;
};

export const createRecipe = async (
  userId: string,
  recipe: z.infer<typeof createRecipeSchema>,
  coverImageName: UUID | null,
) => {
  return await prisma.$transaction(async (prisma) => {
    const createdRecipe = await prisma.recipe.create({
      data: {
        name: recipe.name,
        description: recipe.description,
        quantity: recipe.quantity,
        visibility: recipe.visibility,
        userId,
        timeEstimateMinimumMinutes: recipe.timeEstimateMinimumMinutes,
        timeEstimateMaximumMinutes: recipe.timeEstimateMaximumMinutes,
        coverImageName,
      },
    });

    await prisma.instruction.createMany({
      data: recipe.instructions.map((instruction, index) => ({
        description: instruction.description,
        recipeId: createdRecipe.id,
        order: index,
      })),
    });

    await prisma.ingredientSection.createMany({
      data: recipe.ingredientSections.map((ingredientSection, index) => ({
        name: ingredientSection.name,
        recipeId: createdRecipe.id,
        order: index,
      })),
    });

    const ingredientSections = await prisma.ingredientSection.findMany({
      where: {
        recipeId: createdRecipe.id,
      },
    });

    await prisma.ingredient.createMany({
      data: recipe.ingredientSections.flatMap(
        (ingredientSection, ingredientSectionIndex) => {
          return ingredientSection.ingredients.map(
            (ingredient, ingredientIndex) => ({
              name: ingredient.name,
              quantity: ingredient.quantity,
              unit: ingredient.unit,
              isOptional: ingredient.isOptional,
              ingredientSectionId:
                ingredientSections[ingredientSectionIndex].id,
              order: ingredientIndex,
            }),
          );
        },
      ),
    });

    if (recipe.tags && recipe.tags.length > 0) {
      await prisma.tag.createMany({
        data: recipe.tags.map((tag, tagIndex) => ({
          text: tag,
          recipeId: createdRecipe.id,
          order: tagIndex,
        })),
      });
    }

    const recipeWithIngredients = await prisma.recipe.findUnique({
      where: {
        id: createdRecipe.id,
      },
      include: {
        ingredientSections: {
          include: {
            ingredients: {
              orderBy: {
                order: "asc",
              },
            },
          },
          orderBy: {
            order: "asc",
          },
        },
        instructions: {
          orderBy: {
            order: "asc",
          },
        },
        tags: {
          orderBy: {
            order: "asc",
          },
        },
      },
    });

    if (!recipeWithIngredients)
      throw new Error(
        "Recipe not found after creation. This should never happen.",
      );

    return recipeWithIngredients;
  });
};

export const editRecipe = async (
  recipeId: string,
  editedRecipe: z.infer<typeof editRecipeSchema>,
  coverImageName?: string | undefined | null,
) => {
  await prisma.$transaction(async (prisma) => {
    const originalRecipe = await prisma.recipe.findUnique({
      where: {
        id: recipeId,
      },
      include: {
        ingredientSections: {
          include: {
            ingredients: true,
          },
        },
        instructions: true,
      },
    });

    if (!originalRecipe) {
      throw new Error("Recipe not found");
    }

    const touchedIngredientSectionIds = (editedRecipe.ingredientSections ?? [])
      .map((ingredientSection) =>
        "id" in ingredientSection ? ingredientSection.id : undefined,
      )
      .filter((id): id is string => id !== undefined);

    const touchedIngredientSections = await prisma.ingredientSection.findMany({
      where: {
        id: {
          in: touchedIngredientSectionIds,
        },
      },
    });
    const hasAccessToAllIngredientSections = touchedIngredientSections.every(
      (ingredientSection) => ingredientSection.recipeId === recipeId,
    );
    if (!hasAccessToAllIngredientSections) {
      throw new Error("Cannot move ingredient section to another recipe");
    }

    const ingredientIds = (editedRecipe.ingredientSections ?? [])
      .flatMap((ingredientSection) => ingredientSection.ingredients)
      .map((ingredient) =>
        ingredient && "id" in ingredient ? ingredient.id : undefined,
      )
      .filter((id): id is string => id !== undefined);

    const ingredients = await prisma.ingredient.findMany({
      where: {
        id: {
          in: ingredientIds,
        },
      },
      select: {
        ingredientSection: {
          select: {
            recipeId: true,
          },
        },
      },
    });

    const hasAccessToAllIngredients = ingredients.every(
      (ingredient) => ingredient.ingredientSection.recipeId === recipeId,
    );
    if (!hasAccessToAllIngredients) {
      throw new Error("Cannot move ingredient to another recipe");
    }

    const touchedInstructionIds = (editedRecipe.instructions ?? [])
      .map((instruction) => ("id" in instruction ? instruction.id : undefined))
      .filter((id): id is string => id !== undefined);

    const instructions = await prisma.instruction.findMany({
      where: {
        id: {
          in: touchedInstructionIds,
        },
      },
    });

    const hasAccessToAllInstructions = instructions.every(
      (instruction) => instruction.recipeId === recipeId,
    );
    if (!hasAccessToAllInstructions) {
      throw new Error("Cannot move instruction to another recipe");
    }

    await prisma.recipe.update({
      where: {
        id: recipeId,
      },
      data: {
        name: editedRecipe.name,
        description: editedRecipe.description,
        quantity: editedRecipe.quantity,
        visibility: editedRecipe.visibility,
        timeEstimateMinimumMinutes: editedRecipe.timeEstimateMinimumMinutes,
        timeEstimateMaximumMinutes: editedRecipe.timeEstimateMaximumMinutes,
        coverImageName,
      },
    });

    if (editedRecipe.ingredientSections) {
      // Delete any ingredients that were removed
      const ingredientsToRemove = originalRecipe.ingredientSections.flatMap(
        (originalIngredientSection) => {
          return originalIngredientSection.ingredients.filter(
            (originalIngredient) => {
              return !editedRecipe.ingredientSections?.some(
                (ingredientSection) =>
                  "id" in ingredientSection &&
                  ingredientSection.id === originalIngredientSection.id &&
                  ingredientSection.ingredients?.some(
                    (ingredient) =>
                      "id" in ingredient &&
                      ingredient.id === originalIngredient.id,
                  ),
              );
            },
          );
        },
      );

      await prisma.ingredient.deleteMany({
        where: {
          id: {
            in: ingredientsToRemove.map((ingredient) => ingredient.id),
          },
          ingredientSection: {
            recipe: {
              userId: originalRecipe.userId,
            },
          },
        },
      });

      // Delete any ingredient sections that were removed
      const ingredientSectionsToRemove =
        originalRecipe.ingredientSections.filter(
          (originalIngredientSection) => {
            return !editedRecipe.ingredientSections?.some(
              (ingredientSection) =>
                "id" in ingredientSection &&
                ingredientSection.id === originalIngredientSection.id,
            );
          },
        );

      await prisma.ingredientSection.deleteMany({
        where: {
          id: {
            in: ingredientSectionsToRemove.map(
              (ingredientSection) => ingredientSection.id,
            ),
          },
          recipe: {
            userId: originalRecipe.userId,
          },
        },
      });

      // make all orders negative to allow the them to be changed correctly
      for (let i = 0; i < editedRecipe.ingredientSections.length; i++) {
        const ingredientSection = editedRecipe.ingredientSections[i];
        if ("id" in ingredientSection) {
          await prisma.ingredientSection.update({
            where: {
              id: ingredientSection.id,
            },
            data: {
              order: -i - 1,
            },
          });
        }
      }

      for (let i = 0; i < ingredientIds.length; i++) {
        const ingredientId = ingredientIds[i];

        await prisma.ingredient.update({
          where: {
            id: ingredientId,
          },
          data: {
            order: -i - 1,
          },
        });
      }

      for (
        let ingredientSectionIndex = 0;
        ingredientSectionIndex < editedRecipe.ingredientSections.length;
        ingredientSectionIndex++
      ) {
        const ingredientSection =
          editedRecipe.ingredientSections[ingredientSectionIndex];

        if ("id" in ingredientSection) {
          // This should be updated
          await prisma.ingredientSection.update({
            where: {
              id: ingredientSection.id,
            },
            data: {
              name: ingredientSection.name,
              order: ingredientSectionIndex,
            },
          });

          if (ingredientSection.ingredients !== undefined) {
            for (
              let ingredientIndex = 0;
              ingredientIndex < ingredientSection.ingredients.length;
              ingredientIndex++
            ) {
              const ingredient = ingredientSection.ingredients[ingredientIndex];
              if ("id" in ingredient) {
                // This should be updated
                await prisma.ingredient.update({
                  where: {
                    id: ingredient.id,
                  },
                  data: {
                    name: ingredient.name,
                    quantity: ingredient.quantity,
                    unit: ingredient.unit,
                    isOptional: ingredient.isOptional,
                    order: ingredientIndex,
                  },
                });
              } else {
                // This should be created
                await prisma.ingredient.create({
                  data: {
                    name: ingredient.name,
                    quantity: ingredient.quantity,
                    unit: ingredient.unit,
                    isOptional: ingredient.isOptional,
                    ingredientSectionId: ingredientSection.id,
                    order: ingredientIndex,
                  },
                });
              }
            }
          }
        } else {
          // This should be created
          const createdIngredientSection =
            await prisma.ingredientSection.create({
              data: {
                name: ingredientSection.name,
                recipeId,
                order: ingredientSectionIndex,
              },
            });

          for (
            let ingredientIndex = 0;
            ingredientIndex < ingredientSection.ingredients.length;
            ingredientIndex++
          ) {
            const ingredient = ingredientSection.ingredients[ingredientIndex];
            if ("id" in ingredient) {
              // This should be updated
              await prisma.ingredient.update({
                where: {
                  id: ingredient.id,
                },
                data: {
                  name: ingredient.name,
                  quantity: ingredient.quantity,
                  unit: ingredient.unit,
                  isOptional: ingredient.isOptional,
                  ingredientSectionId: createdIngredientSection.id,
                  order: ingredientIndex,
                },
              });
            } else {
              // This should be created
              await prisma.ingredient.create({
                data: {
                  name: ingredient.name,
                  quantity: ingredient.quantity,
                  unit: ingredient.unit,
                  isOptional: ingredient.isOptional,
                  ingredientSectionId: createdIngredientSection.id,
                  order: ingredientIndex,
                },
              });
            }
          }
        }
      }
    }

    if (editedRecipe.instructions) {
      // Delete any instructions that were removed
      const instructionsToRemove = originalRecipe.instructions.filter(
        (originalInstruction) => {
          return !editedRecipe.instructions?.some(
            (instruction) =>
              "id" in instruction && instruction.id === originalInstruction.id,
          );
        },
      );

      await prisma.instruction.deleteMany({
        where: {
          id: {
            in: instructionsToRemove.map((instruction) => instruction.id),
          },
          recipe: {
            userId: originalRecipe.userId,
          },
        },
      });

      // make all orders negative to allow the them to be changed correctly
      for (let i = 0; i < editedRecipe.instructions.length; i++) {
        const instruction = editedRecipe.instructions[i];
        if ("id" in instruction) {
          await prisma.instruction.update({
            where: {
              id: instruction.id,
            },
            data: {
              order: -i - 1,
            },
          });
        }
      }

      for (let i = 0; i < editedRecipe.instructions.length; i++) {
        const instruction = editedRecipe.instructions[i];

        if ("id" in instruction) {
          // This should be updated
          await prisma.instruction.update({
            where: {
              id: instruction.id,
            },
            data: {
              description: instruction.description,
              order: i,
            },
          });
        } else {
          // This should be created
          await prisma.instruction.create({
            data: {
              description: instruction.description,
              recipeId,
              order: i,
            },
          });
        }
      }
    }

    if (editedRecipe.tags) {
      // TODO: Allow reordering while preserving ids
      await prisma.tag.deleteMany({
        where: {
          recipeId,
        },
      });

      await prisma.tag.createMany({
        data: editedRecipe.tags.map((tag, tagIndex) => ({
          text: tag.text,
          recipeId,
          order: tagIndex,
        })),
      });
    }

    if (editedRecipe.visibility === RecipeVisibility.PRIVATE) {
      await prisma.like.deleteMany({
        where: {
          recipeId,
        },
      });
    }

    if (editedRecipe.visibility) {
      const allowedCollectionVisibilities =
        getValidCollectionVisibilitiesForRecipeVisibility(
          editedRecipe.visibility,
        );

      await prisma.recipesOnCollections.deleteMany({
        where: {
          recipeId,
          recipeCollection: {
            visibility: {
              notIn: allowedCollectionVisibilities,
            },
          },
        },
      });
    }
  });

  const result = await getSingleRecipeWithoutCoverImageUrl(recipeId);

  if (!result) {
    throw new Error("Recipe not found after editing. This should never happen");
  }

  return result;
};

export const getSingleRecipeWithoutCoverImageUrl = async (id: string) => {
  const recipe = await prisma.recipe.findUnique({
    where: {
      id,
    },
    include: {
      ingredientSections: {
        include: {
          ingredients: {
            orderBy: {
              order: "asc",
            },
          },
        },
        orderBy: {
          order: "asc",
        },
      },
      instructions: {
        orderBy: {
          order: "asc",
        },
      },
      tags: {
        orderBy: {
          order: "asc",
        },
      },
      user: true,
    },
  });

  return recipe;
};

export const getSingleRecipe = async (id: string) => {
  const recipe = await getSingleRecipeWithoutCoverImageUrl(id);
  if (!recipe) return null;

  return {
    ...recipe,
    coverImageUrl: recipe.coverImageName
      ? await s3.presignedGetObject(
          process.env.S3_BUCKET_NAME ?? "",
          recipe.coverImageName,
        )
      : undefined,
  };
};

export const increaseViewCountForRecipe = (id: string) =>
  prisma.recipe.update({
    where: {
      id,
    },
    data: {
      viewCount: {
        increment: 1,
      },
    },
  });

export const getPublicRecipesPaginated = async (
  filter: {
    search?: string;
    tags?: string[];
    maximumTime?: number;
    excludedIngredients?: string[];
  },
  sort: SortKey,
  pagination: {
    page: number;
    pageSize: number;
  },
) => {
  // TODO: This could be optimized
  // - https://www.prisma.io/docs/concepts/components/prisma-client/full-text-search
  // - ElasticSearch/Algolia/Meilisearch

  const [column, direction] = sort.split(".") as [SortColumn, SortDirection];

  const map = {
    view: "viewCount",
    createdAt: "createdAt",
    updatedAt: "updatedAt",
    name: "name",
  } as const;

  const sortObj =
    column === "like"
      ? ({
          likes: {
            _count: direction,
          },
        } as const)
      : ({
          [map[column]]: direction,
        } as const);

  const recipes = await prisma.recipe.findMany({
    where: {
      visibility: RecipeVisibility.PUBLIC,
      AND: {
        AND: [
          {
            OR: [
              {
                name: {
                  contains: filter.search,
                  mode: "insensitive" as const,
                },
              },
              {
                description: {
                  contains: filter.search,
                  mode: "insensitive" as const,
                },
              },
              {
                tags: {
                  some: {
                    text: {
                      contains: filter.search,
                      mode: "insensitive" as const,
                    },
                  },
                },
              },
            ],
          },
          filter.maximumTime
            ? {
                OR: [
                  {
                    timeEstimateMinimumMinutes: {
                      lte: filter.maximumTime,
                    },
                    timeEstimateMaximumMinutes: {
                      not: null,
                      lte: filter.maximumTime,
                    },
                  },
                  {
                    timeEstimateMaximumMinutes: null,
                    timeEstimateMinimumMinutes: {
                      lte: filter.maximumTime,
                      gt: 0,
                    },
                  },
                ],
              }
            : null,
          filter.excludedIngredients && filter.excludedIngredients.length
            ? {
                NOT: {
                  ingredientSections: {
                    some: {
                      ingredients: {
                        some: {
                          name: {
                            in: filter.excludedIngredients,
                            mode: "insensitive" as const,
                          },
                        },
                      },
                    },
                  },
                },
              }
            : null,
        ].filter(notNull),
        tags:
          filter.tags && filter.tags.length
            ? {
                some: {
                  text: {
                    in: filter.tags,
                  },
                },
              }
            : undefined,
      },
    },
    orderBy: sortObj,
    skip: pagination.page * pagination.pageSize,
    take: pagination.pageSize,
  });

  const recipesWithCoverImageUrls = await Promise.all(
    recipes.map(async (recipe) => {
      return {
        ...recipe,
        coverImageUrl: recipe.coverImageName
          ? await s3.presignedGetObject(
              process.env.S3_BUCKET_NAME ?? "",
              recipe.coverImageName,
            )
          : undefined,
      };
    }),
  );

  const count = await prisma.recipe.count({
    where: {
      visibility: RecipeVisibility.PUBLIC,
    },
  });

  return { recipes: recipesWithCoverImageUrls, count };
};

export const getLikedRecipes = async (userId: string) => {
  const recipes = await prisma.recipe.findMany({
    where: {
      likes: {
        some: {
          userId,
        },
      },
    },
    include: {
      ingredientSections: {
        include: {
          ingredients: {
            orderBy: {
              order: "asc",
            },
          },
        },
        orderBy: {
          order: "asc",
        },
      },
      instructions: {
        orderBy: {
          order: "asc",
        },
      },
      tags: {
        orderBy: {
          order: "asc",
        },
      },
    },
  });

  const recipesWithCoverImageUrls = await Promise.all(
    recipes.map(async (recipe) => ({
      ...recipe,
      coverImageUrl: recipe.coverImageName
        ? await s3.presignedGetObject(
            process.env.S3_BUCKET_NAME ?? "",
            recipe.coverImageName,
          )
        : undefined,
    })),
  );

  return recipesWithCoverImageUrls;
};

export const deleteRecipeById = async (id: string) => {
  await prisma.recipe.delete({
    where: {
      id,
    },
  });
};
