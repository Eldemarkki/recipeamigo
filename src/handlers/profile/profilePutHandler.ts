import config from "../../config";
import { prisma } from "../../db";
import type { Handler } from "../../utils/apiUtils";
import { UsernameAlreadyTakenError } from "../../utils/errors";
import { z } from "zod";

export const profileSchema = z.object({
  name: z
    .string()
    .min(config.USERNAME_MIN_LENGTH)
    .max(config.USERNAME_MAX_LENGTH)
    .regex(config.USERNAME_REGEX),
});

export const profilePutHandler = {
  requireUser: true,
  bodyValidator: profileSchema,
  handler: async (user, body) => {
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

    // If someone else has the username, throw an error
    // We want to allow the user to change to the same username with different case
    if (existingProfile && existingProfile.clerkId !== user.userId) {
      throw new UsernameAlreadyTakenError(body.name);
    }

    const profile = await prisma.userProfile.update({
      where: {
        clerkId: user.userId,
      },
      data: {
        username: body.name,
      },
    });

    return profile;
  },
} satisfies Handler<{
  name: string;
}>;
