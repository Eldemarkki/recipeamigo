import { GetServerSideProps } from "next";
import { getUserIdFromRequest } from "../../../utils/auth";
import { getSingleRecipe } from "../../../database/recipes";
import { Ingredient, Recipe } from "@prisma/client";
import { ConvertDates } from "../../../utils/types";

export type RecipePageProps = {
  recipe: ConvertDates<Recipe> & {
    ingredients: Ingredient[];
  }
};

export default function RecipePage(props: RecipePageProps) {
  return <div>
    <h1>{props.recipe.name}</h1>
  </div>;
}

export const getServerSideProps: GetServerSideProps<RecipePageProps> = async (context) => {
  const recipeId = context.query.id;
  if (typeof recipeId !== "string" || recipeId.length === 0) {
    throw new Error("Recipe id is not a string");
  }

  const userId = await getUserIdFromRequest(context.req);
  const recipe = await getSingleRecipe(recipeId);

  if (!recipe) {
    return {
      notFound: true,
    };
  }

  if (recipe.isPublic) {
    return {
      props: {
        recipe: {
          ...recipe,
          createdAt: recipe.createdAt.getTime(),
          updatedAt: recipe.updatedAt.getTime(),
        }
      },
    };
  }

  if (userId && userId === recipe.userId) {
    return {
      props: {
        recipe: {
          ...recipe,
          createdAt: recipe.createdAt.getTime(),
          updatedAt: recipe.updatedAt.getTime(),
        }
      },
    };
  }

  return {
    redirect: {
      destination: "/login",
      permanent: false,
    },
  };
};
