import { AuthorizedUser, getUserFromRequest } from "../utils/auth";
import { NotFoundError } from "../utils/errors";
import { FlatNamespace } from "i18next";
import { GetServerSidePropsContext } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { z } from "zod";

export type PropsLoaderHandler<QueryType = unknown, PropsType = unknown> =
  | {
      requireUser: false;
      requiredTranslationNamespaces: FlatNamespace[];
      handler: (user: AuthorizedUser | null) => Promise<PropsType>;
      queryValidator?: null;
    }
  | {
      requireUser: false;
      requiredTranslationNamespaces: FlatNamespace[];
      queryValidator: z.ZodType<QueryType>;
      handler: (
        user: AuthorizedUser | null,
        query: QueryType,
      ) => Promise<PropsType>;
    };

export type PropsLoader<QueryType = unknown, PropsType = unknown> = {
  ctx: GetServerSidePropsContext;
} & PropsLoaderHandler<QueryType, PropsType>;

export const loadProps = async <QueryType = unknown, PropsType = unknown>({
  ctx,
  requireUser,
  requiredTranslationNamespaces,
  ...other
}: PropsLoader<QueryType, PropsType>) => {
  const u = await getUserFromRequest(ctx.req);

  // In the future we may have requireUser: true for some pages
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (requireUser && !u) {
    return {
      redirect: {
        destination: "/login" as const,
        permanent: false,
      },
    };
  }

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
        props = await other.handler(user, queryResult.data);
      }
    } else {
      props = await other.handler(user);
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
