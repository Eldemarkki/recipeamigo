import { IngredientList } from "./IngredientList";
import styles from "./IngredientSection.module.css";
import type {
  Ingredient,
  IngredientSection as IngredientSectionType,
} from "@prisma/client";
import { useTranslation } from "next-i18next";

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
  const { t } = useTranslation("recipeView");

  return (
    <div className={styles.container}>
      <h3>{section.name}</h3>
      {section.ingredients.length > 0 ? (
        <IngredientList
          ingredients={section.ingredients}
          recipeQuantity={recipeQuantity}
          originalRecipeQuantity={originalRecipeQuantity}
        />
      ) : (
        <p>{t("edit.ingredientSections.empty")}</p>
      )}
    </div>
  );
};
