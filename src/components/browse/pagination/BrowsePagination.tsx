import config from "../../../config";
import { Link } from "../../link/Link";
import styles from "./BrowsePagination.module.css";
import { ArrowLeftIcon, ArrowRightIcon } from "@radix-ui/react-icons";
import { useTranslation } from "next-i18next";

export type BrowsePaginationProps = {
  page: number;
  pageSize: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
};

export const BrowsePagination = ({
  page,
  pageSize,
  hasNextPage,
  hasPreviousPage,
}: BrowsePaginationProps) => {
  const { t } = useTranslation("browse");

  const previousPageParameters = new URLSearchParams();
  const nextPageParameters = new URLSearchParams();

  if (page > 2) {
    previousPageParameters.set("page", `${page - 1}`);
  }
  nextPageParameters.set("page", `${page + 1}`);

  if (pageSize !== config.RECIPE_PAGINATION_DEFAULT_PAGE_SIZE) {
    previousPageParameters.set("pageSize", `${pageSize}`);
    nextPageParameters.set("pageSize", `${pageSize}`);
  }

  return (
    <div className={styles.container}>
      <div className={styles.linksContainer}>
        {hasPreviousPage && (
          <Link
            href={`/browse${
              previousPageParameters.size ? "?" + previousPageParameters : ""
            }`}
            title={t("pagination.previousPage")}
            aria-label={t("pagination.previousPage")}
          >
            <ArrowLeftIcon className={styles.leftIcon} />
          </Link>
        )}
        <span
          className={styles.currentPageText}
          title={t("pagination.currentPage", { page })}
          aria-label={t("pagination.currentPage", { page })}
        >
          {page}
        </span>
        {hasNextPage && (
          <Link
            href={`/browse${
              nextPageParameters.size ? "?" + nextPageParameters : ""
            }`}
            className={styles.nextPageLink}
            title={t("pagination.nextPage")}
            aria-label={t("pagination.nextPage")}
          >
            <ArrowRightIcon className={styles.rightIcon} />
          </Link>
        )}
      </div>
    </div>
  );
};
