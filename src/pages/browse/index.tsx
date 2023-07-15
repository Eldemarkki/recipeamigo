import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { getPublicRecipesPaginated } from "../../database/recipes";
import config from "../../config";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import styles from "./index.module.css";
import { RecipeCardGrid } from "../../components/RecipeCardGrid";
import { BrowsePagination } from "../../components/browse/pagination/BrowsePagination";

const BrowsePage = ({
  pagination,
  recipes,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const { t } = useTranslation("browse");

  return (
    <div className={styles.container}>
      <h1>{t("title")}</h1>
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

  const pagination = validatePagination(
    // Starts from page 1
    (parseInt(pageStr as string, 10) - 1) || 0,
    parseInt(pageSizeStr as string, 10) ||
    config.RECIPE_PAGINATION_DEFAULT_PAGE_SIZE
  );

  const { recipes, count } = await getPublicRecipesPaginated(pagination);

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
    },
  };
}) satisfies GetServerSideProps;

export default BrowsePage;
