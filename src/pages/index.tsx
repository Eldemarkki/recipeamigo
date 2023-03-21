import config from "../config";
import Link from "next/link";
import { GetServerSideProps } from "next";
import { getUserFromRequest } from "../utils/auth";
import { JwtPayload } from "jsonwebtoken";
import { Recipe } from "@prisma/client";
import { getAllRecipesForUser } from "../database/recipes";
import { ConvertDates } from "../utils/types";

type HomeProps = {
  user: string | JwtPayload;
  recipes: ConvertDates<Recipe>[];
}

export default function Home(props: HomeProps) {
  return <main>
    <h1>{config.APP_NAME}</h1>
    <Link href="/profile">Profile</Link>
    <div>Logged in as {typeof props.user === "string" ? props.user : props.user.sub}</div>
    <ul>
      {props.recipes.map(recipe => <li key={recipe.id}>{recipe.name}</li>)}
    </ul>
  </main>;
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
