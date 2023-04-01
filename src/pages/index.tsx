import { GetServerSideProps } from "next";
import { getUserFromRequest } from "../utils/auth";
import { Recipe } from "@prisma/client";
import { getAllRecipesForUser } from "../database/recipes";
import { ConvertDates } from "../utils/types";
import { RecipeCardGrid } from "../components/RecipeCardGrid";
import styled from "styled-components";
import { NewRecipeButton } from "../components/NewRecipeButton";

type HomeProps = {
  recipes: ConvertDates<Recipe>[];
}

const Container = styled.div({
  display: "flex",
  flexDirection: "column",
  padding: "3rem 5rem",
  gap: "1.5rem"
});

const RecipesTitleRow = styled.div({
  display: "flex",
  flexDirection: "row",
  gap: "2rem",
  alignItems: "center",
});

export default function Home({ recipes }: HomeProps) {
  return <Container>
    <RecipesTitleRow>
      <h2>My recipes</h2>
      <NewRecipeButton />
    </RecipesTitleRow>
    <RecipeCardGrid showCreateButton recipes={recipes} />
  </Container>;
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
