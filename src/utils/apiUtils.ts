import { AuthorizedUser, getUserFromRequest } from "./auth";
import {
  BadRequestError,
  HttpError,
  HttpStatusCode,
  InvalidQueryParametersError,
  UnauthorizedError,
} from "./errors";
import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";

export type HandlerParameters<
  BodyType = unknown,
  QueryType = unknown,
  ResponseType = unknown,
> = {
  req: NextApiRequest;
  res: NextApiResponse;
} & Handler<BodyType, QueryType, ResponseType>;

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
} => {
  if (error instanceof HttpError) {
    return { message: error.message, status: error.status };
  }

  return { message: "Internal server error", status: 500 };
};

export const handle = async <BodyType, QueryType, ResponseType>({
  req,
  res,
  handler,
  bodyValidator,
  queryValidator,
  requireUser,
}: HandlerParameters<BodyType, QueryType, ResponseType>) => {
  try {
    if (bodyValidator) {
      const result = bodyValidator.safeParse(req.body);
      if (!result.success) {
        throw new BadRequestError(result.error.message);
      }

      const user = await getUserFromRequest(req);
      if (requireUser === true) {
        if (user.status === "Unauthorized") {
          throw new UnauthorizedError();
        }

        if (queryValidator) {
          const queryResult = queryValidator.safeParse(req.query);
          if (queryResult && !queryResult.success) {
            throw new InvalidQueryParametersError(queryResult.error.message);
          }

          const query = queryResult?.data;
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
          if (queryResult && !queryResult.success) {
            throw new InvalidQueryParametersError(queryResult.error.message);
          }

          const query = queryResult?.data;
          const responseBody = await handler(userOrNull, result.data, query);
          res.status(200).json(responseBody);
        } else {
          const responseBody = await handler(userOrNull, result.data);
          res.status(200).json(responseBody);
        }
      }
    } else {
      const user = await getUserFromRequest(req);
      if (requireUser === true) {
        if (user.status === "Unauthorized") {
          throw new UnauthorizedError();
        }

        if (queryValidator) {
          const queryResult = queryValidator.safeParse(req.query);
          if (queryResult && !queryResult.success) {
            throw new InvalidQueryParametersError(queryResult.error.message);
          }

          const query = queryResult?.data;
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
          if (queryResult && !queryResult.success) {
            throw new InvalidQueryParametersError(queryResult.error.message);
          }

          const query = queryResult?.data;
          const responseBody = await handler(userOrNull, query);
          res.status(200).json(responseBody);
        } else {
          const responseBody = await handler(userOrNull);
          res.status(200).json(responseBody);
        }
      }
    }
  } catch (e) {
    const { message, status } = errorMapper(e);
    res.status(status).json({ message });
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
