import type { AuthorizedUser } from "./auth";
import { getUserFromRequest } from "./auth";
import { ErrorCode, type HttpStatusCode } from "./errors";
import {
  BadRequestError,
  HttpError,
  InvalidQueryParametersError,
  UnauthorizedError,
} from "./errors";
import type { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import type { z } from "zod";

export type Handler<
  BodyType = unknown,
  QueryType = unknown,
  ResponseType = unknown,
> =
  | {
      requireUser: true;
      bodyValidator: z.ZodType<BodyType>;
      handler: (
        user: AuthorizedUser,
        body: BodyType,
        query: QueryType,
      ) => Promise<ResponseType> | ResponseType;
      queryValidator: z.ZodType<QueryType>;
    }
  | {
      requireUser: false;
      bodyValidator: z.ZodType<BodyType>;
      handler: (
        user: AuthorizedUser | null,
        body: BodyType,
        query: QueryType,
      ) => Promise<ResponseType> | ResponseType;
      queryValidator: z.ZodType<QueryType>;
    }
  | {
      requireUser: true;
      bodyValidator: z.ZodType<BodyType>;
      handler: (
        user: AuthorizedUser,
        body: BodyType,
      ) => Promise<ResponseType> | ResponseType;
      queryValidator?: null;
    }
  | {
      requireUser: false;
      bodyValidator: z.ZodType<BodyType>;
      handler: (
        user: AuthorizedUser | null,
        body: BodyType,
      ) => Promise<ResponseType> | ResponseType;
      queryValidator?: null;
    }
  | {
      requireUser: true;
      bodyValidator?: null;
      handler: (
        user: AuthorizedUser,
        query: QueryType,
      ) => Promise<ResponseType> | ResponseType;
      queryValidator: z.ZodType<QueryType>;
    }
  | {
      requireUser: false;
      bodyValidator?: null;
      handler: (
        user: AuthorizedUser | null,
        query: QueryType,
      ) => Promise<ResponseType> | ResponseType;
      queryValidator: z.ZodType<QueryType>;
    }
  | {
      requireUser: true;
      bodyValidator?: null;
      handler: (user: AuthorizedUser) => Promise<ResponseType> | ResponseType;
      queryValidator?: null;
    }
  | {
      requireUser: false;
      bodyValidator?: null;
      handler: (
        user: AuthorizedUser | null,
      ) => Promise<ResponseType> | ResponseType;
      queryValidator?: null;
    };

const errorMapper = (
  error: unknown,
): {
  message: string;
  status: HttpStatusCode;
  code: ErrorCode;
} => {
  if (error instanceof HttpError) {
    return { message: error.message, status: error.status, code: error.code };
  }

  return {
    message: "Internal server error",
    status: 500,
    code: ErrorCode.InternalServerError,
  };
};

const handle = async <BodyType, QueryType, ResponseType>({
  req,
  res,
  handler,
  bodyValidator,
  queryValidator,
  requireUser,
}: {
  req: NextApiRequest;
  res: NextApiResponse;
} & Handler<BodyType, QueryType, ResponseType>) => {
  try {
    if (bodyValidator) {
      const result = bodyValidator.safeParse(req.body);
      if (!result.success) {
        throw new BadRequestError(ErrorCode.BadRequest, result.error.message);
      }

      const user = await getUserFromRequest(req);
      if (requireUser) {
        if (user.status === "Unauthorized") {
          throw new UnauthorizedError(ErrorCode.Unauthorized);
        }

        if (queryValidator) {
          const queryResult = queryValidator.safeParse(req.query);
          if (!queryResult.success) {
            throw new InvalidQueryParametersError(
              ErrorCode.InvalidQueryParameters,
              queryResult.error.message,
            );
          }

          const query = queryResult.data;
          const responseBody = await handler(user, result.data, query);
          res.status(200).json(responseBody);
        } else {
          const responseBody = await handler(user, result.data);
          res.status(200).json(responseBody);
        }
      } else {
        const userOrNull = user.status !== "Unauthorized" ? user : null;
        if (queryValidator) {
          const queryResult = queryValidator.safeParse(req.query);
          if (!queryResult.success) {
            throw new InvalidQueryParametersError(
              ErrorCode.InvalidQueryParameters,
              queryResult.error.message,
            );
          }

          const query = queryResult.data;
          const responseBody = await handler(userOrNull, result.data, query);
          res.status(200).json(responseBody);
        } else {
          const responseBody = await handler(userOrNull, result.data);
          res.status(200).json(responseBody);
        }
      }
    } else {
      const user = await getUserFromRequest(req);
      if (requireUser) {
        if (user.status === "Unauthorized") {
          throw new UnauthorizedError(ErrorCode.Unauthorized);
        }

        if (queryValidator) {
          const queryResult = queryValidator.safeParse(req.query);
          if (!queryResult.success) {
            throw new InvalidQueryParametersError(
              ErrorCode.InvalidQueryParameters,
              queryResult.error.message,
            );
          }

          const query = queryResult.data;
          const responseBody = await handler(user, query);
          res.status(200).json(responseBody);
        } else {
          const responseBody = await handler(user);
          res.status(200).json(responseBody);
        }
      } else {
        const userOrNull = user.status !== "Unauthorized" ? user : null;
        if (queryValidator) {
          const queryResult = queryValidator.safeParse(req.query);
          if (!queryResult.success) {
            throw new InvalidQueryParametersError(
              ErrorCode.InvalidQueryParameters,
              queryResult.error.message,
            );
          }

          const query = queryResult.data;
          const responseBody = await handler(userOrNull, query);
          res.status(200).json(responseBody);
        } else {
          const responseBody = await handler(userOrNull);
          res.status(200).json(responseBody);
        }
      }
    }
  } catch (e) {
    console.error(e);
    const { message, status, code } = errorMapper(e);
    res.status(status).json({ message, status, code });
  }
};

export const mapMethods = <
  GetBodyType = unknown,
  GetQueryType = unknown,
  GetResponseType = unknown,
  PostBodyType = unknown,
  PostQueryType = unknown,
  PostResponseType = unknown,
  PutBodyType = unknown,
  PutQueryType = unknown,
  PutResponseType = unknown,
  DeleteBodyType = unknown,
  DeleteQueryType = unknown,
  DeleteResponseType = unknown,
>({
  get,
  post,
  put,
  delete: deleteHandler,
}: {
  get?: Handler<GetBodyType, GetQueryType, GetResponseType>;
  post?: Handler<PostBodyType, PostQueryType, PostResponseType>;
  put?: Handler<PutBodyType, PutQueryType, PutResponseType>;
  delete?: Handler<DeleteBodyType, DeleteQueryType, DeleteResponseType>;
}) =>
  (async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === "GET" && get) {
      await handle({ req, res, ...get });
      return;
    }

    if (req.method === "POST" && post) {
      await handle({ req, res, ...post });
      return;
    }

    if (req.method === "PUT" && put) {
      await handle({ req, res, ...put });
      return;
    }

    if (req.method === "DELETE" && deleteHandler) {
      await handle({ req, res, ...deleteHandler });
      return;
    }

    res.status(405).end();
    return;
  }) satisfies NextApiHandler;
