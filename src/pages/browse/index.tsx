import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { getPublicRecipesPaginated } from "../../database/recipes";
import config from "../../config";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import styles from "./index.module.css";
import { RecipeCardGrid } from "../../components/RecipeCardGrid";
import { BrowsePagination } from "../../components/browse/pagination/BrowsePagination";
import { BrowseFilter } from "../../components/browse/filter/BrowseFilter";
import { isValidSortParam, queryParamToString } from "../../utils/stringUtils";

const BrowsePage = ({
  pagination,
  recipes,
  query,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const { t } = useTranslation("browse");

  return (
    <div className={styles.container}>
      <h1>{t("title")}</h1>
      <BrowseFilter query={query} />
      <RecipeCardGrid recipes={recipes} />
      <BrowsePagination {...pagination} />
    </div>
  );
};

const validatePagination = (pageInput: number, pageSizeInput: number) => ({
  page: Math.max(pageInput, 0),
  pageSize: Math.max(Math.min(pageSizeInput, 100), 0),
});

export const getServerSideProps = (async ({ query, locale }) => {
  const { page: pageStr, pageSize: pageSizeStr } = query;

  const { search } = query;

  const sortStr = queryParamToString(query.sort) || "";
  const sort = isValidSortParam(sortStr) ? sortStr : config.RECIPE_PAGINATION_DEFAULT_SORT;

  const pagination = validatePagination(
    // Starts from page 1
    (parseInt(pageStr as string, 10) - 1) || 0,
    parseInt(pageSizeStr as string, 10) ||
    config.RECIPE_PAGINATION_DEFAULT_PAGE_SIZE
  );

  const filter = {
    search: queryParamToString(search) || ""
  };

  const { recipes, count } = await getPublicRecipesPaginated(filter, sort, pagination);

  const hasPreviousPage = pagination.page > 0;
  const hasNextPage =
    pagination.page < Math.ceil(count / pagination.pageSize) - 1;

  return {
    props: {
      ...(await serverSideTranslations(locale ?? "en", ["common", "browse"])),
      recipes,
      pagination: {
        // Starts from page 1
        page: pagination.page + 1,
        pageSize: pagination.pageSize,
        hasPreviousPage,
        hasNextPage,
      },
      query
    },
  };
}) satisfies GetServerSideProps;

export default BrowsePage;
