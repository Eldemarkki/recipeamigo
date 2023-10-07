import { prisma } from "../../db";
import type { Handler } from "../../utils/apiUtils";
import {
  ProfileAlreadyExistsError,
  UsernameAlreadyTakenError,
} from "../../utils/errors";
import { z } from "zod";

export const profilePostHandler = {
  requireUser: true,
  bodyValidator: z.object({
    name: z.string(),
  }),
  handler: async (user, body) => {
    if (user.status === "OK") {
      throw new ProfileAlreadyExistsError();
    }

    // Can't use findUnique with case-insensitive search
    // https://github.com/prisma/prisma/discussions/14449#discussioncomment-3207209
    const existingProfile = await prisma.userProfile.findFirst({
      where: {
        username: {
          equals: body.name,
          mode: "insensitive",
        },
      },
    });

    if (existingProfile) {
      throw new UsernameAlreadyTakenError(body.name);
    }

    const profile = await prisma.userProfile.create({
      data: {
        clerkId: user.userId,
        username: body.name,
      },
    });

    return profile;
  },
} satisfies Handler<{
  name: string;
}>;
