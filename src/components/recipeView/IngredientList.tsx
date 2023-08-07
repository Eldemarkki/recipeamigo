import { IngredientText } from "../IngredientText";
import { CrossOffText } from "./CrossOffText";
import styles from "./IngredientList.module.css";
import type { Ingredient } from "@prisma/client";

export type IngredientListProps = {
  ingredients: Ingredient[];
  originalRecipeQuantity: number;
  recipeQuantity: number;
};

export const IngredientList = ({
  ingredients,
  originalRecipeQuantity,
  recipeQuantity,
}: IngredientListProps) => {
  return (
    <ul className={styles.list}>
      {ingredients.map((ingredient) => (
        <li className={styles.listItem} key={ingredient.id}>
          <CrossOffText>
            <IngredientText
              ingredient={ingredient}
              originalRecipeQuantity={originalRecipeQuantity}
              recipeQuantity={recipeQuantity}
            />
          </CrossOffText>
        </li>
      ))}
    </ul>
  );
};
