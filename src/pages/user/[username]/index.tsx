import { RecipeCardGrid } from "../../../components/RecipeCardGrid";
import { PageWrapper } from "../../../components/misc/PageWrapper";
import { getUserAndPublicRecipesByUsername } from "../../../database/users";
import type { Recipe, UserProfile } from "@prisma/client";
import type { GetServerSideProps } from "next";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

export type UserPageProps = {
  user: UserProfile & {
    recipes: Recipe[];
  };
};

export default function UserPage({ user }: UserPageProps) {
  const { t } = useTranslation();

  return (
    <PageWrapper title={user.username}>
      <h2>{t("userPage:recipesTitle")}</h2>
      {user.recipes.length > 0 ? (
        <>
          <p>{t("userPage:recipeCount", { count: user.recipes.length })}</p>
          <RecipeCardGrid recipes={user.recipes} />
        </>
      ) : (
        <p>{t("userPage:noRecipes")}</p>
      )}
    </PageWrapper>
  );
}

export const getServerSideProps: GetServerSideProps<UserPageProps> = async (
  context,
) => {
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
      user: visitingUser,
    },
  };
};
