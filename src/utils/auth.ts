import config from "../config";
import { prisma } from "../db";
import { UserProfile } from "@prisma/client";
import { createRemoteJWKSet, jwtVerify } from "jose";

const getTokenFromRequest = (req: {
  headers: { authorization?: string };
  cookies: { hanko?: string };
}) => {
  const authorizationParts = req.headers.authorization?.split(" ");
  if (authorizationParts && authorizationParts[0] === "Bearer") {
    return authorizationParts[1];
  }

  const hankoCookie = req.cookies.hanko ?? null;
  return hankoCookie;
};

const JWKS = createRemoteJWKSet(new URL("/.well-known/jwks.json", config.HANKO_URL));

export const getRawUserIdFromRequest = async (req: {
  headers: { authorization?: string };
  cookies: { hanko?: string };
}) => {
  if (process.env.NODE_ENV === "test") {
    return req.headers.authorization;
  }

  const token = getTokenFromRequest(req);
  if (!token) {
    return null;
  }

  try {
    const decoded = await jwtVerify(token, JWKS, { algorithms: ["RS256"] });
    if (!decoded) {
      return null;
    }

    const userId = decoded.payload.sub;
    if (!userId) {
      console.warn("Decoded user has no sub");
      return null;
    }

    return userId;
  }
  catch (e) {
    return null;
  }
};

export const getUserFromRequest = async (req: {
  headers: { authorization?: string };
  cookies: { hanko?: string };
}): Promise<{
  status: "Unauthorized";
} | {
  status: "OK";
  userId: string;
  userProfile: UserProfile
} | {
  status: "No profile";
  userId: string;
}> => {
  const rawUserId = await getRawUserIdFromRequest(req);
  if (!rawUserId) {
    return { status: "Unauthorized" };
  }

  const userProfile = await prisma.userProfile.findUnique({
    where: {
      hankoId: rawUserId,
    },
  });

  if (!userProfile) {
    return {
      status: "No profile",
      userId: rawUserId,
    };
  }

  return {
    status: "OK",
    userId: rawUserId,
    userProfile,
  };
};
