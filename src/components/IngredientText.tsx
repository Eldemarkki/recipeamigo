import { useTranslation } from "next-i18next";
import { RawIngredient } from "./recipeEngine/ingredients/IngredientForm";
import { UNIT_SELECT_TRANSLATION_KEYS } from "../utils/units";
import { getIngredientText, isIngredientType } from "../ingredients/ingredientTranslator";
import { Locale } from "../i18next";

export type IngredientTextProps = {
  ingredient: RawIngredient;
} & ({} | {
  originalRecipeQuantity: number;
  recipeQuantity: number;
})

export const IngredientText = (props: IngredientTextProps) => {
  const { t, i18n } = useTranslation();

  const { ingredient } = props;
  const multiplier = "recipeQuantity" in props ? props.recipeQuantity / props.originalRecipeQuantity : 1;

  if (isIngredientType(ingredient.name)) return getIngredientText(ingredient.name, ingredient.quantity * multiplier, ingredient.unit, i18n.language as Locale);

  if (ingredient.unit === null) return <>{ingredient.quantity * multiplier} {ingredient.name}{ingredient.isOptional && " (optional)"}</>;

  const unit = t(UNIT_SELECT_TRANSLATION_KEYS[ingredient.unit]);

  return <>
    {ingredient.quantity * multiplier} {unit} {ingredient.name}{ingredient.isOptional && " (optional)"}
  </>;
};
