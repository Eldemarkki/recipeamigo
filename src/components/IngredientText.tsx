import { RawIngredient } from "./recipeEngine/IngredientForm";

export type IngredientTextProps = {
  ingredient: RawIngredient;
} & ({} | {
  originalRecipeQuantity: number;
  recipeQuantity: number;
})

export const IngredientText = (props: IngredientTextProps) => {
  const { ingredient } = props;
  const multiplier = "recipeQuantity" in props ? props.recipeQuantity / props.originalRecipeQuantity : 1;

  return <>
    {ingredient.quantity * multiplier} {ingredient.unit?.toLowerCase()} {ingredient.name}{ingredient.isOptional && " (optional)"}
  </>;
};
