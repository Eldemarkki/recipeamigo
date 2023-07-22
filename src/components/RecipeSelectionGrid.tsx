import styles from "./RecipeSelectionGrid.module.css";
import { RecipeSelectionTile } from "./RecipeSelectionTile";

export type RecipeSelectionGridProps = {
  recipes: {
    id: string;
    name: string;
    coverImageUrl?: string | undefined | null;
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
