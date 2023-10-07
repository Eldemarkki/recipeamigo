import { prisma } from "../../db";
import type { AuthorizedUser } from "../auth";
import { randomUUID } from "crypto";

export const createRandomString = (length: number): string => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

export const createRandomNumber = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const createRandomBoolean = (): boolean => {
  return Math.random() < 0.5;
};

export const createRandomArray = <T>(
  length: number,
  createItem: () => T,
): T[] => {
  return Array.from({ length }, createItem);
};

export const createUserToDatabase = async () => {
  const userId = randomUUID();

  await prisma.userProfile.create({
    data: {
      clerkId: userId,
      username: createRandomString(20),
    },
  });

  return userId;
};

export const createUserToDatabaseAndAuthenticate = async (
  username?: string,
) => {
  const userId = randomUUID();
  const finalUsername = username ?? createRandomString(20);

  await prisma.userProfile.create({
    data: {
      clerkId: userId,
      username: finalUsername,
    },
  });

  return {
    status: "OK",
    userId: userId,
    userProfile: {
      clerkId: userId,
      username: finalUsername,
    },
  } satisfies AuthorizedUser;
};
