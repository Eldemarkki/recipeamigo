import { getAuth } from "@clerk/nextjs/server";
import { prisma } from "../db";
import { UserProfile } from "@prisma/client";
import { RequestLike } from "@clerk/nextjs/dist/types/server/types";

export const getUserFromRequest = async (
  req: RequestLike
): Promise<
  | {
      status: "Unauthorized";
    }
  | {
      status: "OK";
      userId: string;
      userProfile: UserProfile;
    }
  | {
      status: "No profile";
      userId: string;
    }
> => {
  const { userId } = getAuth(req);
  if (!userId) {
    return { status: "Unauthorized" };
  }

  const userProfile = await prisma.userProfile.findUnique({
    where: {
      clerkId: userId,
    },
  });

  if (!userProfile) {
    return {
      status: "No profile",
      userId: userId,
    };
  }

  return {
    status: "OK",
    userId: userId,
    userProfile,
  };
};
