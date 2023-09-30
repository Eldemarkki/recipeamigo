import { RecipeCardGrid } from "../../components/RecipeCardGrid";
import { BrowseFilter } from "../../components/browse/filter/BrowseFilter";
import { BrowsePagination } from "../../components/browse/pagination/BrowsePagination";
import { PageWrapper } from "../../components/misc/PageWrapper";
import { browseRecipesPageDataLoader } from "../../dataLoaders/browse/recipes/browseRecipesPageDataLoader";
import { createPropsLoader } from "../../dataLoaders/loadProps";
import styles from "./index.module.css";
import type { InferGetServerSidePropsType } from "next";
import { useTranslation } from "next-i18next";

const BrowsePage = ({
  pagination,
  recipes,
  query,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const { t } = useTranslation("browse");

  return (
    <PageWrapper title={t("title")}>
      <div className={styles.main}>
        <BrowseFilter query={query} />
        <RecipeCardGrid recipes={recipes} />
      </div>
      <BrowsePagination {...pagination} />
    </PageWrapper>
  );
};

export const getServerSideProps = createPropsLoader(
  browseRecipesPageDataLoader,
  ["common", "browse", "recipeView", "tags"],
);

export default BrowsePage;
