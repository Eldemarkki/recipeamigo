import { RecipeCardGrid } from "../../components/RecipeCardGrid";
import { BrowseFilter } from "../../components/browse/filter/BrowseFilter";
import { BrowsePagination } from "../../components/browse/pagination/BrowsePagination";
import { PageWrapper } from "../../components/misc/PageWrapper";
import config from "../../config";
import { getPublicRecipesPaginated } from "../../database/recipes";
import { isValidSortParam, queryParamToString } from "../../utils/stringUtils";
import styles from "./index.module.css";
import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

const BrowsePage = ({
  pagination,
  recipes,
  query,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const { t } = useTranslation("browse");

  return (
    <PageWrapper title={t("title")}>
      <div className={styles.container}>
        <div className={styles.main}>
          <BrowseFilter query={query} />
          <RecipeCardGrid recipes={recipes} />
        </div>
        <BrowsePagination {...pagination} />
      </div>
    </PageWrapper>
  );
};

const validatePagination = (pageInput: number, pageSizeInput: number) => ({
  page: Math.max(pageInput, 0),
  pageSize: Math.max(Math.min(pageSizeInput, 100), 0),
});

export const getServerSideProps = (async ({ query, locale }) => {
  const { page: pageStr, pageSize: pageSizeStr } = query;

  const { search, tags: queryTags } = query;

  const tags = Array.isArray(queryTags)
    ? queryTags
    : queryTags
    ? [queryTags]
    : [];

  const excludedIngredients = Array.isArray(query.excludedIngredients)
    ? query.excludedIngredients
    : query.excludedIngredients
    ? [query.excludedIngredients]
    : [];

  const maximumTime =
    parseInt(queryParamToString(query.maximumTime) || "0", 10) || undefined;

  const sortStr = queryParamToString(query.sort) || "";
  const sort = isValidSortParam(sortStr)
    ? sortStr
    : config.RECIPE_PAGINATION_DEFAULT_SORT;

  const pagination = validatePagination(
    // Starts from page 1
    parseInt(pageStr as string, 10) - 1 || 0,
    parseInt(pageSizeStr as string, 10) ||
      config.RECIPE_PAGINATION_DEFAULT_PAGE_SIZE,
  );

  const { recipes, count } = await getPublicRecipesPaginated(
    {
      search: queryParamToString(search) || "",
      tags,
      maximumTime,
      excludedIngredients,
    },
    sort,
    pagination,
  );

  const hasPreviousPage = pagination.page > 0;
  const hasNextPage =
    pagination.page < Math.ceil(count / pagination.pageSize) - 1;

  return {
    props: {
      ...(await serverSideTranslations(locale ?? "en", [
        "common",
        "browse",
        "recipeView",
        "tags",
      ])),
      recipes,
      pagination: {
        // Starts from page 1
        page: pagination.page + 1,
        pageSize: pagination.pageSize,
        hasPreviousPage,
        hasNextPage,
      },
      query,
    },
  };
}) satisfies GetServerSideProps;

export default BrowsePage;
