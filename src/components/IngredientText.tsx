import { useTranslation } from "next-i18next";
import { RawIngredient } from "./recipeEngine/ingredients/IngredientForm";
import { getIngredientText } from "../ingredients/ingredientTranslator";
import { Locale } from "../i18next";

export type IngredientTextProps = {
  ingredient: RawIngredient;
} & ({} | {
  originalRecipeQuantity: number;
  recipeQuantity: number;
})

export const IngredientText = (props: IngredientTextProps) => {
  const { i18n } = useTranslation();

  const { ingredient } = props;

  const multiplier = "recipeQuantity" in props ? props.recipeQuantity / props.originalRecipeQuantity : 1;

  return getIngredientText(ingredient.name, ingredient.quantity * multiplier, ingredient.unit, ingredient.isOptional, i18n.language as Locale);
};
