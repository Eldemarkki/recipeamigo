import type { IngredientUnit } from "@prisma/client";
import type { ParseKeys } from "i18next";

type UnitTranslationKey = `units:${ParseKeys<"units">}`;

export const UNIT_SELECT_TRANSLATION_KEYS: Record<IngredientUnit, UnitTranslationKey> = {
  GRAM: "units:unitSelect.GRAM",
  CUP: "units:unitSelect.CUP",
  TEASPOON: "units:unitSelect.TEASPOON",
  TABLESPOON: "units:unitSelect.TABLESPOON",
  OUNCE: "units:unitSelect.OUNCE",
  POUND: "units:unitSelect.POUND",
  MILLILITER: "units:unitSelect.MILLILITER",
  DECILITER: "units:unitSelect.DECILITER",
  LITER: "units:unitSelect.LITER",
  PINCH: "units:unitSelect.PINCH",
  DASH: "units:unitSelect.DASH",
  CLOVE: "units:unitSelect.CLOVE",
  QUART: "units:unitSelect.QUART",
  PINT: "units:unitSelect.PINT",
  GALLON: "units:unitSelect.GALLON",
  KILOGRAM: "units:unitSelect.KILOGRAM",
  SLICE: "units:unitSelect.SLICE",
  HANDFUL: "units:unitSelect.HANDFUL",
  CAN: "units:unitSelect.CAN",
  BOTTLE: "units:unitSelect.BOTTLE",
  PACKAGE: "units:unitSelect.PACKAGE",
};
