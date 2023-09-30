import type { AuthorizedUser } from "../utils/auth";
import { getUserFromRequest } from "../utils/auth";
import { NotFoundError } from "../utils/errors";
import type { FlatNamespace } from "i18next";
import type { GetServerSideProps, GetServerSidePropsContext } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import type { z } from "zod";

export type PropsLoaderHandler<QueryType = unknown, PropsType = unknown> =
  | {
      requireUser: true;
      handler: (user: AuthorizedUser) => Promise<PropsType>;
      queryValidator?: null;
    }
  | {
      requireUser: true;
      handler: (user: AuthorizedUser, query: QueryType) => Promise<PropsType>;
      queryValidator: z.ZodType<QueryType>;
    }
  | {
      requireUser: false;
      handler: (user: AuthorizedUser | null) => Promise<PropsType>;
      queryValidator?: null;
    }
  | {
      requireUser: false;
      handler: (
        user: AuthorizedUser | null,
        query: QueryType,
      ) => Promise<PropsType>;
      queryValidator: z.ZodType<QueryType>;
    };

export type PropsLoader<QueryType = unknown, PropsType = unknown> = {
  ctx: GetServerSidePropsContext;
  requiredTranslationNamespaces: FlatNamespace[];
} & PropsLoaderHandler<QueryType, PropsType>;

export const loadProps = async <QueryType = unknown, PropsType = unknown>({
  ctx,
  requiredTranslationNamespaces,
  ...other
}: PropsLoader<QueryType, PropsType>) => {
  const u = await getUserFromRequest(ctx.req);

  const user = u.status === "Unauthorized" ? null : u;

  let props: PropsType;

  try {
    if (other.queryValidator) {
      const queryResult = other.queryValidator.safeParse(ctx.query);
      if (!queryResult.success) {
        return {
          notFound: true as const,
        };
      } else {
        if (other.requireUser) {
          if (user) {
            props = await other.handler(user, queryResult.data);
          } else {
            return {
              redirect: {
                destination: "/login" as const,
                permanent: false,
              },
            };
          }
        } else {
          props = await other.handler(user, queryResult.data);
        }
      }
    } else {
      if (other.requireUser) {
        if (user) {
          props = await other.handler(user);
        } else {
          return {
            redirect: {
              destination: "/login" as const,
              permanent: false,
            },
          };
        }
      } else {
        props = await other.handler(user);
      }
    }

    return {
      props: {
        ...(await serverSideTranslations(
          ctx.locale ?? "en",
          requiredTranslationNamespaces,
        )),
        ...props,
      },
    };
  } catch (e) {
    if (e instanceof NotFoundError) {
      return {
        notFound: true as const,
      };
    }
    throw e;
  }
};

export const createPropsLoader = <QueryType = unknown, PropsType = unknown>(
  loader: PropsLoaderHandler<QueryType, PropsType>,
  requiredTranslationNamespaces: FlatNamespace[],
) =>
  ((ctx) =>
    loadProps({
      ctx,
      requiredTranslationNamespaces,
      ...loader,
    })) satisfies GetServerSideProps;
