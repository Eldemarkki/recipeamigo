import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { getPublicRecipesPaginated } from "../../database/recipes";
import { Link } from "../../components/link/Link";
import config from "../../config";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import styles from "./index.module.css";

const BrowsePage = ({
  pagination,
  recipes,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const { t } = useTranslation("browse");

  const previousPageParameters = new URLSearchParams();
  const nextPageParameters = new URLSearchParams();

  if (pagination.page > 1) {
    previousPageParameters.set("page", `${pagination.page - 1}`);
  }
  nextPageParameters.set("page", `${pagination.page + 1}`);

  if (pagination.pageSize !== config.RECIPE_PAGINATION_DEFAULT_PAGE_SIZE) {
    previousPageParameters.set("pageSize", `${pagination.pageSize}`);
    nextPageParameters.set("pageSize", `${pagination.pageSize}`);
  }

  return (
    <div>
      <h1>{t("title")}</h1>
      <ol className={styles.recipeList}>
        {recipes.map((recipe) => (
          <li key={recipe.id}>
            <Link href={`/recipe/${recipe.id}`}><h2>{recipe.name}</h2></Link>
            <p>{recipe.description}</p>
          </li>
        ))}
      </ol>
      <div>
        {pagination.hasPreviousPage && (
          <Link href={`/browse${previousPageParameters.size ? "?" + previousPageParameters : ""}`}>
            {t("pagination.previousPage")}
          </Link>
        )}
        {pagination.hasNextPage && (
          <Link href={`/browse${nextPageParameters.size ? "?" + nextPageParameters : ""}`}>
            {t("pagination.nextPage")}
          </Link>
        )}
      </div>
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
    parseInt(pageStr as string, 10) || 0,
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
        ...pagination,
        hasPreviousPage,
        hasNextPage,
      },
    },
  };
}) satisfies GetServerSideProps;

export default BrowsePage;
