import type { SortKey } from "./components/browse/sort/BrowseSort";

const config = {
  APP_NAME: "Recipeamigo",

  // The smallest common denominator for 1-6 columns
  RECIPE_PAGINATION_DEFAULT_PAGE_SIZE: 60,
  RECIPE_PAGINATION_DEFAULT_SORT: "createdAt.desc" satisfies SortKey,

  RECIPE_COVER_IMAGE_MAX_SIZE_BYTES: 5 * 1024 * 1024, // 5 MiB
  RECIPE_COVER_POST_POLICY_EXPIRATION: 1000 * 60 * 5, // 5 minutes
} as const;

export default config;
