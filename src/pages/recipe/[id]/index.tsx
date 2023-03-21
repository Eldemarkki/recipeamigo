import { GetServerSideProps } from "next";
import { getUserFromRequest } from "../../../utils/auth";
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
  const user = await getUserFromRequest(context.req);
  if (!user) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  if (typeof user === "string") {
    throw new Error("User is a string");
  }

  const userId = user.sub;
  if (!userId) {
    throw new Error("User has no sub");
  }

  const recipeId = context.query.id;
  if (typeof recipeId !== "string" || recipeId.length === 0) {
    throw new Error("Recipe id is not a string");
  }

  const recipe = await getSingleRecipe(recipeId);
  if (!recipe || recipe.userId !== userId) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      recipe: {
        ...recipe,
        createdAt: recipe.createdAt.getTime(),
        updatedAt: recipe.updatedAt.getTime(),
      }
    },
  };
};
