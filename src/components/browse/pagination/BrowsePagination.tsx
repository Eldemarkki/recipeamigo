import { generateSearchParams } from "../../../utils/browseUtils";
import { Link } from "../../link/Link";
import type { SortKey } from "../sort/BrowseSort";
import styles from "./BrowsePagination.module.css";
import { ArrowLeftIcon, ArrowRightIcon } from "@radix-ui/react-icons";
import { useTranslation } from "next-i18next";

export type BrowsePaginationProps = {
  pagination: {
    page: number;
    pageSize: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
  query: {
    search: string | undefined;
    tags: string[];
    excludedIngredients: string[];
    maximumTime: number | undefined;
    sort: SortKey;
  };
};

export const BrowsePagination = ({
  pagination: { page, pageSize, hasPreviousPage, hasNextPage },
  query,
}: BrowsePaginationProps) => {
  const { t } = useTranslation("browse");

  const previousPageParameters = generateSearchParams({
    ...query,
    pagination: {
      page: page - 1,
      pageSize,
    },
  });

  const nextPageParameters = generateSearchParams({
    ...query,
    pagination: {
      page: page + 1,
      pageSize,
    },
  });

  return (
    <div className={styles.container}>
      <div className={styles.linksContainer}>
        {hasPreviousPage && (
          <Link
            href={`/browse${
              previousPageParameters.size
                ? "?" + previousPageParameters.toString()
                : ""
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
              nextPageParameters.size ? "?" + nextPageParameters.toString() : ""
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
