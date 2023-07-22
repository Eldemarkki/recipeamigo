import { z } from "zod";
import {
  createRecipeSchema,
  ingredientSchema,
  ingredientSectionSchema,
  instructionSchema,
} from "../../pages/api/recipes";
import {
  createRandomArray,
  createRandomBoolean,
  createRandomNumber,
  createRandomString,
} from "./testUtils";
import { IngredientUnit } from "@prisma/client";

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

export const createRandomRecipe = (): z.infer<typeof createRecipeSchema> => ({
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
  isPublic: createRandomBoolean(),
  timeEstimateMinimumMinutes: createRandomNumber(0, 10),
  timeEstimateMaximumMinutes: createRandomNumber(10, 20),
});
