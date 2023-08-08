import type { Locale } from "../i18next";
import { capitalize } from "../utils/stringUtils";
import type { IngredientUnit } from "@prisma/client";

const englishUnits: Record<
  IngredientUnit,
  {
    singular: string;
    plural: string;
  }
> = {
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
  PACKAGE: { singular: "package", plural: "packages" },
} as const;

const finnishUnits: Record<
  IngredientUnit,
  {
    singular: string;
    plural: string;
  }
> = {
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
  PACKAGE: { singular: "paketti", plural: "pakettia" },
} as const;

export const englishIngredients = {
  tomato: { singular: "tomato", plural: "tomatoes" },
  garlic: { singular: "garlic", plural: "garlic" },
  egg: { singular: "egg", plural: "eggs" },
  flour: { singular: "flour", plural: "flour" },
  sugar: { singular: "sugar", plural: "sugar" },
  salt: { singular: "salt", plural: "salt" },
  water: { singular: "water", plural: "water" },
  milk: { singular: "milk", plural: "milk" },
  bakingSoda: { singular: "baking soda", plural: "baking soda" },
  bakingPowder: { singular: "baking powder", plural: "baking powder" },
  yeast: { singular: "yeast", plural: "yeast" },
  whiteSugar: { singular: "white sugar", plural: "white sugar" },
  brownSugar: { singular: "brown sugar", plural: "brown sugar" },
  seaSalt: { singular: "sea salt", plural: "sea salt" },
  butter: { singular: "butter", plural: "butter" },
  oil: { singular: "oil", plural: "oil" },
  vegetableOil: { singular: "vegetable oil", plural: "vegetable oil" },
  oliveOil: { singular: "olive oil", plural: "olive oil" },
  vanillaExtract: { singular: "vanilla extract", plural: "vanilla extract" },
  lemonJuice: { singular: "lemon juice", plural: "lemon juice" },
  limeJuice: { singular: "lime juice", plural: "lime juice" },
  orangeJuice: { singular: "orange juice", plural: "orange juice" },
  lemonZest: { singular: "lemon zest", plural: "lemon zest" },
  limeZest: { singular: "lime zest", plural: "lime zest" },
  orangeZest: { singular: "orange zest", plural: "orange zest" },
  lemon: { singular: "lemon", plural: "lemons" },
  lime: { singular: "lime", plural: "limes" },
  orange: { singular: "orange", plural: "oranges" },
  apple: { singular: "apple", plural: "apples" },
  banana: { singular: "banana", plural: "bananas" },
  pear: { singular: "pear", plural: "pears" },
} as const;

export type IngredientType = keyof typeof englishIngredients;

const finnishIngredients = {
  tomato: { singular: "tomaatti", plural: "tomaattia" },
  garlic: { singular: "valkosipuli", plural: "valkosipulia" },
  egg: { singular: "kananmuna", plural: "kananmunaa" },
  flour: { singular: "vehnäjauho", plural: "vehnäjauhoa" },
  sugar: { singular: "sokeri", plural: "sokeria" },
  salt: { singular: "suola", plural: "suolaa" },
  water: { singular: "vesi", plural: "vettä" },
  milk: { singular: "maito", plural: "maitoa" },
  bakingSoda: { singular: "ruokasooda", plural: "ruokasoodaa" },
  bakingPowder: { singular: "leivinjauhe", plural: "leivinjauhetta" },
  yeast: { singular: "hiiva", plural: "hiivaa" },
  whiteSugar: { singular: "valkoinen sokeri", plural: "valkoista sokeria" },
  brownSugar: { singular: "ruskea sokeri", plural: "ruskeaa sokeria" },
  seaSalt: { singular: "merisuola", plural: "merisuolaa" },
  butter: { singular: "voi", plural: "voita" },
  oil: { singular: "öljy", plural: "öljyä" },
  vegetableOil: { singular: "kasviöljy", plural: "kasviöljyä" },
  oliveOil: { singular: "oliiviöljy", plural: "oliiviöljyä" },
  vanillaExtract: { singular: "vanilja", plural: "vaniljaa" },
  lemonJuice: { singular: "sitruunamehu", plural: "sitruunamehua" },
  limeJuice: { singular: "limettimehu", plural: "limettimehua" },
  orangeJuice: { singular: "appelsiinimehu", plural: "appelsiinimehua" },
  lemonZest: { singular: "sitruunan kuori", plural: "sitruunan kuorta" },
  limeZest: { singular: "limen kuori", plural: "limen kuorta" },
  orangeZest: { singular: "appelsiinin kuori", plural: "appelsiinin kuorta" },
  lemon: { singular: "sitruuna", plural: "sitruunaa" },
  lime: { singular: "lime", plural: "limeä" },
  orange: { singular: "appelsiini", plural: "appelsiinia" },
  apple: { singular: "omena", plural: "omenaa" },
  banana: { singular: "banaani", plural: "banaania" },
  pear: { singular: "päärynä", plural: "päärynää" },
} satisfies Record<IngredientType, { singular: string; plural: string }>;

const optionalTranslations: Record<Locale, string> = {
  en: "optional",
  fi: "valinnainen",
};

const ingredientsLocaleMap = {
  en: englishIngredients,
  fi: finnishIngredients,
} as const;

export const unitsLocaleMap = {
  en: englishUnits,
  fi: finnishUnits,
} as const;

const getRequiredAmountType = (amount: number, unit: IngredientUnit | null) => {
  if (unit !== null) {
    return "plural";
  } else {
    return amount === 1 ? "singular" : "plural";
  }
};

export const getIngredientText = (
  ingredient: string,
  amount: number,
  unit: IngredientUnit | null,
  isOptional: boolean,
  language: Locale,
) => {
  const ingredientText = isIngredientType(ingredient)
    ? ingredientsLocaleMap[language][ingredient]
    : { singular: ingredient, plural: ingredient };

  const requiredAmountType = getRequiredAmountType(amount, unit);
  const finalIngredientText = ingredientText[requiredAmountType];

  // TODO: This doesn't work for right-to-left languages
  const optionalText = isOptional ? ` (${optionalTranslations[language]})` : "";

  if (unit === null) {
    return `${amount} ${finalIngredientText}${optionalText}`;
  }
  const unitText = unitsLocaleMap[language][unit];

  const finalUnitText = amount === 1 ? unitText.singular : unitText.plural;

  if (language === "en") {
    return `${amount} ${finalUnitText} of ${finalIngredientText}${optionalText}`;
  }

  return `${amount} ${finalUnitText} ${finalIngredientText}${optionalText}`;
};

export const isIngredientType = (
  ingredient: string,
): ingredient is IngredientType => {
  return Object.keys(englishIngredients).includes(ingredient);
};

export const getIngredientDropdownLabel = (
  ingredient: string,
  language: Locale,
) => {
  if (isIngredientType(ingredient)) {
    return capitalize(ingredientsLocaleMap[language][ingredient].singular);
  }

  return capitalize(ingredient);
};
