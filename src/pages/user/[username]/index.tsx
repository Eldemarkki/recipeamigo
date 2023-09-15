import { RecipeCardGrid } from "../../../components/RecipeCardGrid";
import { CollectionsList } from "../../../components/collections/CollectionsList";
import { PageWrapper } from "../../../components/misc/PageWrapper";
import { getUserAndPublicRecipesAndPublicCollectionsByUsername } from "../../../database/users";
import styles from "./index.module.css";
import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

export default function UserPage({
  user,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { t } = useTranslation("userPage");

  return (
    <PageWrapper title={user.username} mainClass={styles.content}>
      <section className={styles.section}>
        <h2>{t("recipesTitle")}</h2>
        {user.recipes.length > 0 ? (
          <>
            <p>{t("recipeCount", { count: user.recipes.length })}</p>
            <RecipeCardGrid recipes={user.recipes} />
          </>
        ) : (
          <p>{t("noRecipes")}</p>
        )}
      </section>
      <section className={styles.section}>
        <h2>{t("collections.title")}</h2>
        {user.recipeCollections.length > 0 ? (
          <>
            <p>
              {t("collections.collectionCount", {
                count: user.recipeCollections.length,
              })}
            </p>
            <CollectionsList collections={user.recipeCollections} />
          </>
        ) : (
          <p>{t("collections.noCollections")}</p>
        )}
      </section>
    </PageWrapper>
  );
}

// TODO: Refactor to use props loader
export const getServerSideProps = (async (context) => {
  const username = context.params?.username;
  if (typeof username !== "string") {
    throw new Error("Username is not a string. This should never happen");
  }

  const visitingUser =
    await getUserAndPublicRecipesAndPublicCollectionsByUsername(username);
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
}) satisfies GetServerSideProps;
