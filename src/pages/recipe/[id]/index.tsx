import { GetServerSideProps } from "next";
import { getUserIdFromRequest } from "../../../utils/auth";
import { getSingleRecipe } from "../../../database/recipes";
import { Ingredient, Recipe } from "@prisma/client";
import { ConvertDates } from "../../../utils/types";
import styled from "styled-components";
import { useState } from "react";
import { RecipeQuantityPicker } from "../../../components/recipeView/RecipeQuantityPicker";
import { IngredientList } from "../../../components/recipeView/IngredientList";

export type RecipePageProps = {
  recipe: ConvertDates<Recipe> & {
    ingredients: Ingredient[];
  }
};

const Container = styled.main({
  display: "flex",
  flexDirection: "column",
  padding: "5rem",
});

const Title = styled.h1({
  fontSize: "3rem",
});

const IngredientsContainer = styled.div({
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
  maxWidth: 350
});

export default function RecipePage(props: RecipePageProps) {
  const originalQuantity = props.recipe.quantity;

  const [recipeAmount, setRecipeAmount] = useState(props.recipe.quantity);

  return <Container>
    <Title>{props.recipe.name}</Title>
    <IngredientsContainer>
      <RecipeQuantityPicker quantity={recipeAmount} onChange={setRecipeAmount} />
      <IngredientList
        ingredients={props.recipe.ingredients}
        originalRecipeQuantity={originalQuantity}
        recipeQuantity={recipeAmount}
      />
    </IngredientsContainer>
  </Container>;
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
