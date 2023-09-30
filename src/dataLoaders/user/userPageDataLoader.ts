import { getUserAndPublicRecipesAndPublicCollectionsByUsername } from "../../database/users";
import { UserNotFoundError } from "../../utils/errors";
import type { PropsLoaderHandler } from "../loadProps";
import { z } from "zod";

export const userPageDataLoader = {
  requireUser: false,
  queryValidator: z.object({ username: z.string() }),
  handler: async (_user, { username }) => {
    const visitingUser =
      await getUserAndPublicRecipesAndPublicCollectionsByUsername(username);
    if (!visitingUser) {
      throw new UserNotFoundError(username);
    }

    return {
      user: visitingUser,
    };
  },
} satisfies PropsLoaderHandler<{
  username: string;
}>;
