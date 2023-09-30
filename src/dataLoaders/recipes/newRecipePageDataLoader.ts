import type { PropsLoaderHandler } from "../loadProps";

export const newRecipePageDataLoader = {
  requireUser: true,
  queryValidator: null,
  handler: async () => Promise.resolve({}),
} satisfies PropsLoaderHandler;
