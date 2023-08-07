import type {
  createRecipeSchema,
  ingredientSchema,
  ingredientSectionSchema,
  instructionSchema,
} from "../../handlers/recipes/recipesPostHandler";
import {
  createRandomArray,
  createRandomBoolean,
  createRandomNumber,
  createRandomString,
} from "./testUtils";
import { IngredientUnit, RecipeVisibility } from "@prisma/client";
import type { z } from "zod";

export const createRandomIngredientUnit = (): IngredientUnit => {
  const units = Object.values(IngredientUnit);
  const randomIndex = createRandomNumber(0, units.length - 1);
  return units[randomIndex];
};

export const createRandomIngredient = (): z.infer<typeof ingredientSchema> => ({
  name: createRandomString(10),
  quantity: createRandomNumber(1, 10),
  unit: createRandomIngredientUnit(),
  isOptional: createRandomBoolean(),
});

export const createRandomIngredientSection = (): z.infer<
  typeof ingredientSectionSchema
> => ({
  name: createRandomString(10),
  ingredients: createRandomArray(
    createRandomNumber(1, 10),
    createRandomIngredient,
  ),
});

export const createRandomInstruction = (): z.infer<
  typeof instructionSchema
> => ({
  description: createRandomString(30),
});

export const createRandomRecipeVisibility = (): RecipeVisibility => {
  const visibilities = Object.values(RecipeVisibility);
  const randomIndex = createRandomNumber(0, visibilities.length - 1);
  return visibilities[randomIndex];
};

export const createRandomRecipe = (
  values?: Partial<z.infer<typeof createRecipeSchema>>,
): z.infer<typeof createRecipeSchema> => ({
  name: createRandomString(10),
  description: createRandomString(10),
  ingredientSections: createRandomArray(
    createRandomNumber(1, 5),
    createRandomIngredientSection,
  ),
  instructions: createRandomArray(
    createRandomNumber(3, 10),
    createRandomInstruction,
  ),
  quantity: createRandomNumber(1, 10),
  visibility: createRandomRecipeVisibility(),
  timeEstimateMinimumMinutes: createRandomNumber(0, 10),
  timeEstimateMaximumMinutes: createRandomNumber(10, 20),
  ...values,
});
