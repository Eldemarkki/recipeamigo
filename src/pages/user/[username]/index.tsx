import { GetServerSideProps } from "next";
import { getUserAndPublicRecipesByUsername } from "../../../database/users";
import { Recipe, UserProfile } from "@prisma/client";
import { RecipeCardGrid } from "../../../components/RecipeCardGrid";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

export type UserPageProps = {
  user: UserProfile & {
    recipes: Recipe[];
  };
};

export default function UserPage({ user }: UserPageProps) {
  const { t } = useTranslation();

  return <div>
    <h1>{user.username}</h1>
    <h2>{t("userPage:recipesTitle")}</h2>
    {user.recipes.length > 0 ?
      <>
        <p>{t("userPage:recipeCount", { count: user.recipes.length })}</p>
        <RecipeCardGrid recipes={user.recipes} />
      </> : <p>{t("userPage:noRecipes")}</p>
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
      ...(await serverSideTranslations(context.locale ?? "en")),
      user: visitingUser
    }
  };
};
