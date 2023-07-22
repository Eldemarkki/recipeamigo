import { RecipeCard } from "./RecipeCard";
import { NewRecipeCard } from "./NewRecipeCard";
import styles from "./RecipeCardGrid.module.css";

export type RecipeCardGridProps = {
  showCreateButton?: boolean | undefined | null;
  recipes: {
    id: string;
    name: string;
    description: string;
    coverImageUrl?: string | undefined | null;
  }[];
};

export const RecipeCardGrid = (props: RecipeCardGridProps) => {
  return (
    <div className={styles.grid}>
      {props.showCreateButton && <NewRecipeCard />}
      {props.recipes.map((recipe) => (
        <RecipeCard
          key={recipe.id}
          id={recipe.id}
          name={recipe.name}
          description={recipe.description}
          coverImageUrl={recipe.coverImageUrl}
        />
      ))}
    </div>
  );
};
