import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { getUserFromRequest } from "../utils/auth";
import { getAllRecipesForUser } from "../database/recipes";
import { RecipeCardGrid } from "../components/RecipeCardGrid";
import { LinkButton } from "../components/LinkButton";
import styles from "./page.module.css";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { NewCollectionButton } from "../components/NewCollectionButton";

export default function Home({
  recipes,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { t } = useTranslation("home");

  return (
    <div className={styles.container}>
      <div className={styles.recipesTitleRow}>
        <h2>{t("myRecipes")}</h2>
        <LinkButton href="/recipe/new">{t("newRecipeButton")}</LinkButton>
        <NewCollectionButton recipes={recipes} />
      </div>
      <RecipeCardGrid showCreateButton recipes={recipes} />
    </div>
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
