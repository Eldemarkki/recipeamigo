import { GetServerSideProps } from "next";
import { getUserFromRequest } from "../utils/auth";
import { Recipe } from "@prisma/client";
import { getAllRecipesForUser } from "../database/recipes";
import { ConvertDates } from "../utils/types";
import { RecipeCardGrid } from "../components/RecipeCardGrid";
import { NewRecipeButton } from "../components/NewRecipeButton";
import styles from "./page.module.css";

type HomeProps = {
  recipes: ConvertDates<Recipe>[];
}

export default function Home({ recipes }: HomeProps) {
  return <div className={styles.container}>
    <div className={styles.recipesTitleRow}>
      <h2>My recipes</h2>
      <NewRecipeButton />
    </div>
    <RecipeCardGrid showCreateButton recipes={recipes} />
  </div>;
}

export const getServerSideProps: GetServerSideProps<HomeProps> = async ({ req }) => {
  const user = await getUserFromRequest(req);

  if (user.status === "Unauthorized") {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      }
    };
  }

  if (user.status === "No profile") {
    return {
      redirect: {
        destination: "/profile/create",
        permanent: false,
      }
    };
  }

  const recipes = await getAllRecipesForUser(user.userId);

  return {
    props: {
      recipes: recipes.map(recipe => ({
        ...recipe,
        createdAt: recipe.createdAt.getTime(),
        updatedAt: recipe.updatedAt.getTime(),
      }))
    },
  };
};
