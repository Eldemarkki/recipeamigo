import { RecipeCardGrid } from "../../../components/RecipeCardGrid";
import { CollectionsList } from "../../../components/collections/CollectionsList";
import { PageWrapper } from "../../../components/misc/PageWrapper";
import config from "../../../config";
import { createPropsLoader } from "../../../dataLoaders/loadProps";
import { userPageDataLoader } from "../../../dataLoaders/user/userPageDataLoader";
import styles from "./index.module.css";
import type { InferGetServerSidePropsType } from "next";
import { useTranslation } from "next-i18next";
import Head from "next/head";

export default function UserPage({
  user,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { t } = useTranslation("userPage");

  return (
    <>
      <Head>
        <title>{`${user.username} | ${config.APP_NAME}`}</title>
      </Head>
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
    </>
  );
}

export const getServerSideProps = createPropsLoader(userPageDataLoader, [
  "common",
  "userPage",
  "browse",
]);
