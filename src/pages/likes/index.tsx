import { RecipeCardGrid } from "../../components/RecipeCardGrid";
import { PageWrapper } from "../../components/misc/PageWrapper";
import { likesPageDataLoader } from "../../dataLoaders/likes/likesPageDataLoader";
import { loadProps } from "../../dataLoaders/loadProps";
import styles from "./index.module.css";
import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { useTranslation } from "next-i18next";

export default function LikesPage({
  likedRecipes,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { t } = useTranslation("likes");

  return (
    <PageWrapper title={t("title")}>
      <div className={styles.container}>
        <p>{t("likedCount", { count: likedRecipes.length })}</p>
        {likedRecipes.length > 0 && <RecipeCardGrid recipes={likedRecipes} />}
      </div>
    </PageWrapper>
  );
}

export const getServerSideProps = ((ctx) =>
  loadProps({
    ctx,
    requiredTranslationNamespaces: ["common", "likes"],
    ...likesPageDataLoader,
  })) satisfies GetServerSideProps;
