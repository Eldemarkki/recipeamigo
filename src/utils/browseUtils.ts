import type { SortKey } from "../components/browse/sort/BrowseSort";
import config from "../config";

export const generateSearchParams = ({
  search,
  tags,
  excludedIngredients,
  maximumTime,
  sort,
  pagination,
}: {
  search?: string;
  tags?: string[];
  excludedIngredients?: string[];
  maximumTime?: number;
  sort?: SortKey;
  pagination?: {
    page?: number;
    pageSize?: number;
  };
}) => {
  const searchParams = new URLSearchParams();
  if (search) {
    searchParams.set("search", search);
  }
  if (tags) {
    tags.forEach((tag) => {
      searchParams.append("tags", tag);
    });
  }
  if (excludedIngredients !== undefined) {
    excludedIngredients.forEach((ingredient) => {
      searchParams.append("excludedIngredients", ingredient);
    });
  }

  if (maximumTime) {
    searchParams.set("maximumTime", maximumTime.toString());
  }

  if (sort && sort !== config.RECIPE_PAGINATION_DEFAULT_SORT) {
    searchParams.set("sort", sort);
  }

  if (pagination) {
    if (pagination.page !== undefined && pagination.page !== 1) {
      searchParams.set("page", pagination.page.toString());
    }
    if (
      pagination.pageSize !== undefined &&
      pagination.pageSize !== config.RECIPE_PAGINATION_DEFAULT_PAGE_SIZE
    ) {
      searchParams.set("pageSize", pagination.pageSize.toString());
    }
  }

  return searchParams;
};
