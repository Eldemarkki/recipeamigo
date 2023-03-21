import { decode, verify } from "jsonwebtoken";
import jwkToPem from "jwk-to-pem";
import config from "../config";

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

export const getUserFromRequest = async (req: {
  headers: { authorization?: string };
  cookies: { hanko?: string };
}) => {
  const token = getTokenFromRequest(req);
  if (!token) {
    return null;
  }

  const response = await fetch(config.HANKO_URL + "/.well-known/jwks.json");
  const text = await response.json();

  const jwks = text;
  const signingKey = jwks.keys[0];
  const pem = jwkToPem(signingKey);
  try {
    const isValid = verify(token, pem, { algorithms: ["RS256"] });
    if (!isValid) {
      return null;
    }

    const decoded = decode(token);
    return decoded;
  }
  catch (e) {
    return null;
  }
};
