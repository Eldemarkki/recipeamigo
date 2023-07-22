import {
  Ingredient,
  IngredientSection as IngredientSectionType,
} from "@prisma/client";
import { IngredientList } from "./IngredientList";
import styles from "./IngredientSection.module.css";

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
      <h3 className={styles.title}>{section.name}</h3>
      <IngredientList
        ingredients={section.ingredients}
        recipeQuantity={recipeQuantity}
        originalRecipeQuantity={originalRecipeQuantity}
      />
    </div>
  );
};
