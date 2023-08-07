import type { Locale } from "../i18next";
import { getIngredientText } from "../ingredients/ingredientTranslator";
import type { RawIngredient } from "./recipeEngine/ingredients/IngredientForm";
import { useTranslation } from "next-i18next";

export type IngredientTextProps = {
  ingredient: RawIngredient;
} & (
  | object
  | {
      originalRecipeQuantity: number;
      recipeQuantity: number;
    }
);

export const IngredientText = (props: IngredientTextProps) => {
  const { i18n } = useTranslation();

  const { ingredient } = props;

  const multiplier =
    "recipeQuantity" in props
      ? props.recipeQuantity / props.originalRecipeQuantity
      : 1;

  return getIngredientText(
    ingredient.name,
    ingredient.quantity * multiplier,
    ingredient.unit,
    ingredient.isOptional,
    i18n.language as Locale,
  );
};
