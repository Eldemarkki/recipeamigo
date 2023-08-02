import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { AuthorizedUser, getUserFromRequest } from "./auth";

export type AuthorizedUserRequestHandler<
  BodyType = unknown,
  ResponseType = unknown,
> = (user: AuthorizedUser, body: BodyType) => Promise<ResponseType>;

export type UnauthorizedUserRequestHandler<
  BodyType = unknown,
  ResponseType = unknown,
> = (user: AuthorizedUser | null, body: BodyType) => Promise<ResponseType>;

type AuthHandler<
  RequireAuth extends boolean,
  BodyType,
  ResponseType,
> = RequireAuth extends true
  ? AuthorizedUserRequestHandler<BodyType, ResponseType>
  : UnauthorizedUserRequestHandler<BodyType, ResponseType>;

export const handle = async <BodyType, ResponseType>({
  req,
  res,
  bodyValidator,
  requireUser,
  handler,
}: {
  req: NextApiRequest;
  res: NextApiResponse;
  bodyValidator: z.ZodType<BodyType>;
} & (
  | {
      requireUser: true;
      handler: AuthHandler<true, BodyType, ResponseType>;
    }
  | {
      requireUser: false;
      handler: AuthHandler<false, BodyType, ResponseType>;
    }
)) => {
  const result = bodyValidator.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ message: "Invalid request body" });
  }

  const user = await getUserFromRequest(req);
  try {
    if (requireUser === true) {
      if (user.status === "Unauthorized") {
        return res.status(401).json({ message: "Not authenticated" });
      }
      const responseBody = await handler(user, result.data);
      res.status(200).json(responseBody);
      return;
    } else {
      const userOrNull = user.status !== "Unauthorized" ? user : null;
      const responseBody = await handler(userOrNull, result.data);
      res.status(200).json(responseBody);
      return;
    }
  } catch (e) {
    console.log(e);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const mapMethods = ({
  get,
  post,
  put,
  delete: deleteHandler,
}: {
  get?: NextApiHandler;
  post?: NextApiHandler;
  put?: NextApiHandler;
  delete?: NextApiHandler;
}) =>
  (async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === "GET" && get) {
      await get(req, res);
      return;
    }

    if (req.method === "POST" && post) {
      await post(req, res);
      return;
    }

    if (req.method === "PUT" && put) {
      await put(req, res);
      return;
    }

    if (req.method === "DELETE" && deleteHandler) {
      await deleteHandler(req, res);
      return;
    }

    res.status(405).end();
    return;
  }) satisfies NextApiHandler;
