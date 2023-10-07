import {
  sorts,
  type SortKey,
} from "../../../components/browse/sort/BrowseSort";
import config from "../../../config";
import { getPublicRecipesPaginated } from "../../../database/recipes";
import {
  isValidSortParam,
  queryParamToString,
} from "../../../utils/stringUtils";
import type { PropsLoaderHandler } from "../../loadProps";
import { z } from "zod";

const validatePagination = (pageInput: number, pageSizeInput: number) => ({
  page: Math.max(pageInput, 0),
  pageSize: Math.max(Math.min(pageSizeInput, 100), 0),
});

export const browseRecipesPageDataLoader = {
  requireUser: false,
  queryValidator: z.object({
    page: z.string().optional(),
    pageSize: z.string().optional(),
    excludedIngredients: z.string().optional().or(z.array(z.string())),
    search: z.string().optional().default(""),
    tags: z.string().optional().or(z.array(z.string())),
    maximumTime: z.string().optional(),
    sort: z.enum(sorts).optional(),
  }),
  handler: async (_user, query) => {
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
      parseInt(pageStr ?? "", 10) - 1 || 0,
      parseInt(pageSizeStr ?? "", 10) ||
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
      recipes,
      pagination: {
        // Starts from page 1
        page: pagination.page + 1,
        pageSize: pagination.pageSize,
        hasPreviousPage,
        hasNextPage,
      },
      query: {
        search,
        tags,
        excludedIngredients,
        maximumTime,
        sort,
      },
    };
  },
} satisfies PropsLoaderHandler<{
  page?: string;
  pageSize?: string;
  excludedIngredients?: string | string[];
  search?: string;
  tags?: string | string[];
  maximumTime?: string;
  sort?: SortKey;
}>;
