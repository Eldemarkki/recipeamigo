import { AuthorizedUser, getUserFromRequest } from "../utils/auth";
import { FlatNamespace } from "i18next";
import { GetServerSidePropsContext, PreviewData } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { ParsedUrlQuery } from "querystring";

export type PropsLoaderHandler<PropsType = unknown> = {
  requireUser: false;
  requiredTranslationNamespaces: FlatNamespace[];
  handler: (user: AuthorizedUser | null) => Promise<PropsType>;
};

export type PropsLoader<PropsType> = {
  ctx: GetServerSidePropsContext<ParsedUrlQuery, PreviewData>;
} & PropsLoaderHandler<PropsType>;

export const loadProps = async <PropsType>({
  ctx,
  requireUser,
  handler,
  requiredTranslationNamespaces,
}: PropsLoader<PropsType>) => {
  const u = await getUserFromRequest(ctx.req);
  if (requireUser && !u) {
    return {
      redirect: {
        destination: "/login" as const,
        permanent: false,
      },
    };
  }

  const user = u.status === "Unauthorized" ? null : u;
  const props = await handler(user);

  return {
    props: {
      ...(await serverSideTranslations(
        ctx.locale ?? "en",
        requiredTranslationNamespaces,
      )),
      ...props,
    },
  };
};
