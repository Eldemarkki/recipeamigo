import styles from "./RecipeSelectionGrid.module.css";
import { RecipeSelectionTile } from "./RecipeSelectionTile";
import { RecipeVisibility } from "@prisma/client";

export type RecipeSelectionGridProps = {
  recipes: {
    id: string;
    name: string;
    coverImageUrl?: string | undefined | null;
    visibility: RecipeVisibility;
    isSelected: boolean;
    onClickSelect: () => void;
  }[];
};

export const RecipeSelectionGrid = ({ recipes }: RecipeSelectionGridProps) => {
  return (
    <div className={styles.grid}>
      {recipes.map((recipe) => (
        <RecipeSelectionTile key={recipe.id} {...recipe} />
      ))}
    </div>
  );
};
