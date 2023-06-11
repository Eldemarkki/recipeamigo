import { useTranslation } from "next-i18next";
import { RawIngredient } from "./recipeEngine/IngredientForm";
import { UNIT_SELECT_TRANSLATION_KEYS } from "../utils/units";

export type IngredientTextProps = {
  ingredient: RawIngredient;
} & ({} | {
  originalRecipeQuantity: number;
  recipeQuantity: number;
})

export const IngredientText = (props: IngredientTextProps) => {
  const { t } = useTranslation();

  const { ingredient } = props;
  const multiplier = "recipeQuantity" in props ? props.recipeQuantity / props.originalRecipeQuantity : 1;

  if (ingredient.unit === null) return <>{ingredient.quantity * multiplier} {ingredient.name}{ingredient.isOptional && " (optional)"}</>;

  const unit = t(UNIT_SELECT_TRANSLATION_KEYS[ingredient.unit]);

  return <>
    {ingredient.quantity * multiplier} {unit} {ingredient.name}{ingredient.isOptional && " (optional)"}
  </>;
};
