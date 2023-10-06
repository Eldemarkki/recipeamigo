import { prisma } from "../../db";
import type { PropsLoaderHandler } from "../loadProps";

export const settingsPageDataLoader = {
  requireUser: false,
  handler: async (user) => {
    if (!user) return {};

    const profile = await prisma.userProfile.findUnique({
      where: {
        clerkId: user.userId,
      },
    });

    return {
      username: profile?.username,
    };
  },
} satisfies PropsLoaderHandler<{
  username?: string;
}>;
