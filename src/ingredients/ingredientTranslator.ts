import { IngredientUnit } from "@prisma/client";
import { Locale } from "../i18next";
import { capitalize } from "../utils/stringUtils";

const englishUnits: Record<IngredientUnit, {
  singular: string;
  plural: string;
}> = {
  GRAM: { singular: "gram", plural: "grams" },
  CUP: { singular: "cup", plural: "cups" },
  TEASPOON: { singular: "teaspoon", plural: "teaspoons" },
  TABLESPOON: { singular: "tablespoon", plural: "tablespoons" },
  OUNCE: { singular: "ounce", plural: "ounces" },
  POUND: { singular: "pound", plural: "pounds" },
  MILLILITER: { singular: "milliliter", plural: "milliliters" },
  DECILITER: { singular: "deciliter", plural: "deciliters" },
  LITER: { singular: "liter", plural: "liters" },
  PINCH: { singular: "pinch", plural: "pinches" },
  DASH: { singular: "dash", plural: "dashes" },
  CLOVE: { singular: "clove", plural: "cloves" },
  QUART: { singular: "quart", plural: "quarts" },
  PINT: { singular: "pint", plural: "pints" },
  GALLON: { singular: "gallon", plural: "gallons" },
  KILOGRAM: { singular: "kilogram", plural: "kilograms" },
  SLICE: { singular: "slice", plural: "slices" },
  HANDFUL: { singular: "handful", plural: "handfuls" },
  CAN: { singular: "can", plural: "cans" },
  BOTTLE: { singular: "bottle", plural: "bottles" },
  PACKAGE: { singular: "package", plural: "packages" }
} as const;

const finnishUnits: Record<IngredientUnit, {
  singular: string;
  plural: string;
}> = {
  GRAM: { singular: "gramma", plural: "grammaa" },
  CUP: { singular: "kuppi", plural: "kuppia" },
  TEASPOON: { singular: "teelusikka", plural: "teelusikkaa" },
  TABLESPOON: { singular: "ruokalusikka", plural: "ruokalusikkaa" },
  OUNCE: { singular: "unssi", plural: "unssia" },
  POUND: { singular: "pauna", plural: "paunaa" },
  MILLILITER: { singular: "millilitra", plural: "millilitraa" },
  DECILITER: { singular: "desilitra", plural: "desilitraa" },
  LITER: { singular: "litra", plural: "litraa" },
  PINCH: { singular: "ripaus", plural: "ripausta" },
  DASH: { singular: "pisara", plural: "pisaraa" },
  CLOVE: { singular: "kynsi", plural: "kynttä" },
  QUART: { singular: "litra", plural: "litraa" },
  PINT: { singular: "pikari", plural: "pikaria" },
  GALLON: { singular: "gallona", plural: "gallonia" },
  KILOGRAM: { singular: "kilogramma", plural: "kilogrammaa" },
  SLICE: { singular: "viipale", plural: "viipaletta" },
  HANDFUL: { singular: "kourallinen", plural: "kourallista" },
  CAN: { singular: "tölkki", plural: "tölkkiä" },
  BOTTLE: { singular: "pullo", plural: "pulloa" },
  PACKAGE: { singular: "paketti", plural: "pakettia" }
} as const;

export const englishIngredients = {
  tomato: { singular: "tomato", plural: "tomatoes" },
  garlic: { singular: "garlic", plural: "garlic" }
} as const;

const finnishIngredients = {
  tomato: { singular: "tomaatti", plural: "tomaattia" },
  garlic: { singular: "valkosipuli", plural: "valkosipulia" }
} as const;

export type IngredientType = keyof typeof englishIngredients;

const ingredientsLocaleMap = {
  en: englishIngredients,
  fi: finnishIngredients,
} as const;

const unitsLocaleMap = {
  en: englishUnits,
  fi: finnishUnits,
} as const;

const getRequiredAmountType = (amount: number, unit: IngredientUnit | null) => {
  if (unit !== null) {
    return "plural";
  }
  else {
    return amount === 1 ? "singular" : "plural";
  }
};

export const getIngredientText = (ingredient: IngredientType, amount: number, unit: IngredientUnit | null, language: Locale) => {
  const ingredientText = ingredientsLocaleMap[language][ingredient];
  const requiredAmountType = getRequiredAmountType(amount, unit);
  const finalIngredientText = ingredientText[requiredAmountType];
  if (unit === null) {
    return `${amount} ${finalIngredientText}`;
  }
  const unitText = unitsLocaleMap[language][unit];

  const finalUnitText = amount === 1 ? unitText.singular : unitText.plural;

  if (language === "en") {
    return `${amount} ${finalUnitText} of ${finalIngredientText}`;
  }

  return `${amount} ${finalUnitText} ${finalIngredientText}`;
};

export const isIngredientType = (ingredient: string): ingredient is IngredientType => {
  return Object.keys(englishIngredients).includes(ingredient);
};

export const getIngredientDropdownLabel = (ingredient: string, language: Locale) => {
  if (isIngredientType(ingredient)) {
    return capitalize(ingredientsLocaleMap[language][ingredient].singular);
  }

  return capitalize(ingredient);
};