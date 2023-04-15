import config from "../config";
import { prisma } from "../db";
import { UserProfile } from "@prisma/client";
import { importJWK, jwtVerify } from "jose";

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

const cacheLimitMilliseconds = 1000 * 60; // 1 minute
let cachedSigningKey: any | null = null;
let lastFetchTime: number | null = null;

const fetchSigningKey = async () => {
  const response = await fetch(config.HANKO_URL + "/.well-known/jwks.json");

  const jwks = await response.json();
  const signingKey = jwks.keys[0];

  lastFetchTime = Date.now();
  cachedSigningKey = signingKey;

  console.log("Fetched signing key");

  return signingKey;
};

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

  const shouldRefetch = !cachedSigningKey || !lastFetchTime || (Date.now() - lastFetchTime) > cacheLimitMilliseconds;
  const signingKey = shouldRefetch ? await fetchSigningKey() : cachedSigningKey;

  const pem = await importJWK(signingKey, "RS256");
  try {
    const decoded = await jwtVerify(token, pem, { algorithms: ["RS256"] });
    if (!decoded) {
      return null;
    }

    if (typeof decoded === "string") {
      console.warn("Decoded user is a string");
      return null;
    }

    if (!decoded) {
      console.warn("Decoded user is null");
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
