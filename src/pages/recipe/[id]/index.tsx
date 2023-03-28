import { GetServerSideProps } from "next";
import { getUserFromRequest } from "../../../utils/auth";
import { getSingleRecipe } from "../../../database/recipes";
import { Ingredient, IngredientSection as IngredientSectionType, Recipe, UserProfile } from "@prisma/client";
import { ConvertDates } from "../../../utils/types";
import styled from "styled-components";
import { useState } from "react";
import { RecipeQuantityPicker } from "../../../components/recipeView/RecipeQuantityPicker";
import { InstructionsList } from "../../../components/recipeView/InstructionsList";
import { IngredientSection } from "../../../components/recipeView/IngredientSection";

export type RecipePageProps = {
  recipe: ConvertDates<Recipe> & {
    ingredientSections: (IngredientSectionType & {
      ingredients: Ingredient[];
    })[];
    user: UserProfile;
  }
};

const Container = styled.main({
  display: "flex",
  flexDirection: "column",
  padding: "3rem 10rem",
  gap: "2rem",
});

const Title = styled.h1({
  fontSize: "3rem",
  margin: 0,
});

const IngredientsContainer = styled.div({
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
  maxWidth: 350
});

const SplitContainer = styled.div({
  display: "flex",
  gap: "8rem"
});

const InstructionsContainer = styled.div({
  display: "flex",
  flexDirection: "column",
});

const IngredientsTitle = styled.h2({
  margin: 0,
});

const InstructionsTitle = styled.h2({
  margin: 0,
});

const TopRow = styled.div({
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
});

const RecipeQuantityPickerContainer = styled.div({
  maxWidth: 250,
});

export default function RecipePage({ recipe }: RecipePageProps) {
  const originalQuantity = recipe.quantity;

  const [recipeAmount, setRecipeAmount] = useState(recipe.quantity);

  return <Container>
    <TopRow>
      <div>
        <Title>{recipe.name}</Title>
        <p>Created by <b>{recipe.user.username}</b></p>
        <p>{recipe.description}</p>
      </div>
      <RecipeQuantityPickerContainer>
        <RecipeQuantityPicker
          quantity={recipeAmount}
          onChange={setRecipeAmount}
        />
      </RecipeQuantityPickerContainer>
    </TopRow>
    <SplitContainer>
      <IngredientsContainer>
        <IngredientsTitle>Ingredients</IngredientsTitle>
        {recipe.ingredientSections.map((section) => <IngredientSection
          key={section.id}
          section={section}
          recipeQuantity={recipeAmount}
          originalRecipeQuantity={originalQuantity}
        />)}
      </IngredientsContainer>
      <InstructionsContainer>
        <InstructionsTitle>Instructions</InstructionsTitle>
        <InstructionsList instructions={recipe.instructions} />
      </InstructionsContainer>
    </SplitContainer>
  </Container>;
}

export const getServerSideProps: GetServerSideProps<RecipePageProps> = async (context) => {
  const recipeId = context.query.id;
  if (typeof recipeId !== "string" || recipeId.length === 0) {
    throw new Error("Recipe id is not a string");
  }

  const user = await getUserFromRequest(context.req);
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

  if (user && (user.status === "No profile" || user.status === "OK")) {
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
