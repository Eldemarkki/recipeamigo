import config from "../config";
import Link from "next/link";
import { GetServerSideProps } from "next";
import { getUserFromRequest } from "../utils/auth";
import { JwtPayload } from "jsonwebtoken";
import { Recipe } from "@prisma/client";
import { getAllRecipesForUser } from "../database/recipes";
import { ConvertDates } from "../utils/types";
import { RecipeCardGrid } from "../components/RecipeCardGrid";
import styled from "styled-components";
import { NewRecipeButton } from "../components/NewRecipeButton";

type HomeProps = {
  user: string | JwtPayload;
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

export default function Home(props: HomeProps) {
  return <Container>
    <h1>{config.APP_NAME}</h1>
    <div>
      <Link href="/profile">Profile</Link>
      <div>Logged in as {typeof props.user === "string" ? props.user : props.user.sub}</div>
    </div>
    <div>
      <RecipesTitleRow>
        <h2>My recipes</h2>
        <NewRecipeButton />
      </RecipesTitleRow>
      <RecipeCardGrid recipes={props.recipes} />
    </div>
  </Container>;
}

export const getServerSideProps: GetServerSideProps<HomeProps> = async ({ req }) => {
  const user = await getUserFromRequest(req);

  if (!user) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      }
    };
  }

  const userId = typeof user === "string" ? null : user.sub;
  if (!userId) throw new Error("User id is null");

  const recipes = await getAllRecipesForUser(userId);

  return {
    props: {
      user: user,
      recipes: recipes.map(recipe => ({
        ...recipe,
        createdAt: recipe.createdAt.getTime(),
        updatedAt: recipe.updatedAt.getTime(),
      }))
    },
  };
};
