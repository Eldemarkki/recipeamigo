import { IngredientList } from "./IngredientList";
import styles from "./IngredientSection.module.css";
import type {
  Ingredient,
  IngredientSection as IngredientSectionType,
} from "@prisma/client";

export type IngredientSectionProps = {
  section: IngredientSectionType & {
    ingredients: Ingredient[];
  };
  recipeQuantity: number;
  originalRecipeQuantity: number;
};

export const IngredientSection = ({
  section,
  recipeQuantity,
  originalRecipeQuantity,
}: IngredientSectionProps) => {
  return (
    <div className={styles.container}>
      <h3>{section.name}</h3>
      <IngredientList
        ingredients={section.ingredients}
        recipeQuantity={recipeQuantity}
        originalRecipeQuantity={originalRecipeQuantity}
      />
    </div>
  );
};
