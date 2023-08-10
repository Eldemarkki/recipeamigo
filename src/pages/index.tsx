import { LinkButton } from "../components/LinkButton";
import { NewCollectionButton } from "../components/NewCollectionButton";
import { RecipeCardGrid } from "../components/RecipeCardGrid";
import { PageWrapper } from "../components/misc/PageWrapper";
import { getAllRecipesForUser } from "../database/recipes";
import { getUserFromRequest } from "../utils/auth";
import styles from "./page.module.css";
import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

export default function Home({
  recipes,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { t } = useTranslation("home");

  return (
    <PageWrapper
      titleRow={
        <div className={styles.recipesTitleRow}>
          <h1>{t("myRecipes")}</h1>
          <div className={styles.recipesTitleRowButtonContainer}>
            <LinkButton href="/recipe/new">{t("newRecipeButton")}</LinkButton>
            <NewCollectionButton recipes={recipes} />
          </div>
        </div>
      }
    >
      <RecipeCardGrid showCreateButton recipes={recipes} />
    </PageWrapper>
  );
}

export const getServerSideProps = (async ({ req, locale }) => {
  const user = await getUserFromRequest(req);

  if (user.status === "Unauthorized") {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  if (user.status === "No profile") {
    return {
      redirect: {
        destination: "/profile/create",
        permanent: false,
      },
    };
  }

  const recipes = await getAllRecipesForUser(user.userId);

  return {
    props: {
      ...(await serverSideTranslations(locale ?? "en")),
      recipes,
    },
  };
}) satisfies GetServerSideProps;
