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
    const existingProfile = await prisma.userProfile.findUnique({
      where: {
        username: body.name,
      },
    });

    if (existingProfile) {
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
