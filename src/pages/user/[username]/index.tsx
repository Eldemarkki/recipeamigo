import { GetServerSideProps } from "next";
import { getUserAndPublicRecipesByUsername } from "../../../database/users";
import { Recipe, UserProfile } from "@prisma/client";
import { ConvertDates } from "../../../utils/types";
import { RecipeCardGrid } from "../../../components/RecipeCardGrid";

export type UserPageProps = {
  user: UserProfile & {
    recipes: ConvertDates<Recipe>[];
  };
};

export default function UserPage({ user }: UserPageProps) {
  return <div>
    <h1>{user.username}</h1>
    <h2>Recipes</h2>
    {user.recipes.length > 0 ?
      <>
        <p>{user.recipes.length} {user.recipes.length === 1 ? "recipe" : "recipes"}</p>
        <RecipeCardGrid recipes={user.recipes} />
      </> : <p>This user doesn&apos;t have any public recipes.</p>
    }
  </div>;
}

export const getServerSideProps: GetServerSideProps<UserPageProps> = async (context) => {
  const username = context.params?.username;
  if (typeof username !== "string") {
    throw new Error("Username is not a string. This should never happen");
  }

  const visitingUser = await getUserAndPublicRecipesByUsername(username);
  if (!visitingUser) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      user: {
        ...visitingUser,
        recipes: visitingUser.recipes.map((recipe) => ({
          ...recipe,
          createdAt: recipe.createdAt.getTime(),
          updatedAt: recipe.updatedAt.getTime(),
        }))
      }
    }
  };
};
