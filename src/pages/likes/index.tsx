import { RecipeCardGrid } from "../../components/RecipeCardGrid";
import { PageWrapper } from "../../components/misc/PageWrapper";
import config from "../../config";
import { likesPageDataLoader } from "../../dataLoaders/likes/likesPageDataLoader";
import { createPropsLoader } from "../../dataLoaders/loadProps";
import styles from "./index.module.css";
import type { InferGetServerSidePropsType } from "next";
import { useTranslation } from "next-i18next";
import Head from "next/head";

export default function LikesPage({
  likedRecipes,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { t } = useTranslation("likes");

  return (
    <>
      <Head>
        <title>{`${t("title")} | ${config.APP_NAME}`}</title>
      </Head>
      <PageWrapper title={t("title")}>
        <div className={styles.container}>
          <p>{t("likedCount", { count: likedRecipes.length })}</p>
          {likedRecipes.length > 0 && <RecipeCardGrid recipes={likedRecipes} />}
        </div>
      </PageWrapper>
    </>
  );
}

export const getServerSideProps = createPropsLoader(likesPageDataLoader, [
  "common",
  "likes",
]);
