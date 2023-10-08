import { NewRecipeCard } from "./NewRecipeCard";
import { RecipeCard } from "./RecipeCard";
import styles from "./RecipeCardGrid.module.css";

export type RecipeCardGridProps = {
  showCreateButton?: boolean | undefined | null;
  recipes: {
    id: string;
    name: string;
    description: string;
    coverImageUrl?: string | undefined | null;
    username?: string | undefined | null;
    viewCount?: number | undefined | null;
    likeCount?: number | undefined | null;
  }[];
};

export const RecipeCardGrid = (props: RecipeCardGridProps) => {
  return (
    <div className={styles.grid}>
      {props.showCreateButton && <NewRecipeCard />}
      {props.recipes.map((recipe) => (
        <RecipeCard key={recipe.id} {...recipe} />
      ))}
    </div>
  );
};
