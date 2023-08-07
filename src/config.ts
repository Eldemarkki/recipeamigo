import type { SortKey } from "./components/browse/sort/BrowseSort";

const config = {
  APP_NAME: "Recipeamigo",
  // The smallest common denominator for 1-6 columns
  RECIPE_PAGINATION_DEFAULT_PAGE_SIZE: 60,
  RECIPE_PAGINATION_DEFAULT_SORT: "like.desc" satisfies SortKey,
} as const;

export default config;
