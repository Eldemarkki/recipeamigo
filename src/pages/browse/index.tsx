import { RecipeCardGrid } from "../../components/RecipeCardGrid";
import { BrowseFilter } from "../../components/browse/filter/BrowseFilter";
import { BrowsePagination } from "../../components/browse/pagination/BrowsePagination";
import { PageWrapper } from "../../components/misc/PageWrapper";
import config from "../../config";
import { browseRecipesPageDataLoader } from "../../dataLoaders/browse/recipes/browseRecipesPageDataLoader";
import { createPropsLoader } from "../../dataLoaders/loadProps";
import styles from "./index.module.css";
import type { InferGetServerSidePropsType } from "next";
import { useTranslation } from "next-i18next";
import Head from "next/head";

const BrowsePage = ({
  pagination,
  recipes,
  query,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const { t } = useTranslation("browse");

  return (
    <>
      <Head>
        <title>{`${t("pageTitle.recipe")} | ${config.APP_NAME}`}</title>
      </Head>
      <PageWrapper title={t("title")}>
        <div className={styles.container}>
          <div className={styles.main}>
            <BrowseFilter query={query} pagination={pagination} />
            {recipes.length > 0 ? (
              <RecipeCardGrid
                recipes={recipes.map((r) => ({
                  ...r,
                  username: r.user.username,
                  likeCount: r._count.likes,
                }))}
              />
            ) : (
              <div>{t("noRecipes")}</div>
            )}
          </div>
          {(pagination.hasNextPage || pagination.hasPreviousPage) && (
            <BrowsePagination query={query} pagination={pagination} />
          )}
        </div>
      </PageWrapper>
    </>
  );
};

export const getServerSideProps = createPropsLoader(
  browseRecipesPageDataLoader,
  ["common", "browse", "recipeView", "tags"],
);

export default BrowsePage;
