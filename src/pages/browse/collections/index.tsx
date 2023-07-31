import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import {
  getPublicCollections,
  getUserCollections,
} from "../../../database/collections";
import { getUserFromRequest } from "../../../utils/auth";
import { CollectionsList } from "../../../components/collections/CollectionsList";
import { useTranslation } from "next-i18next";

export default function BrowseCollectionsPage({
  publicCollections,
  userCollections,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { t } = useTranslation("browse");

  return (
    <div>
      <h1>{t("collections.title")}</h1>
      {userCollections && (
        <>
          <h2>{t("collections.myCollections")}</h2>
          <CollectionsList collections={userCollections} />
        </>
      )}
      <h2>{t("collections.publicCollections")}</h2>
      <CollectionsList collections={publicCollections} />
    </div>
  );
}

export const getServerSideProps = (async ({ req, locale }) => {
  const user = await getUserFromRequest(req);

  const userId = user.status !== "Unauthorized" ? user.userId : undefined;

  const publicCollections = await getPublicCollections();
  const userCollections = userId ? await getUserCollections(userId) : null;

  return {
    props: {
      ...(await serverSideTranslations(locale ?? "en", [
        "common",
        "browse",
        "navbar",
      ])),
      publicCollections,
      userCollections,
    },
  };
}) satisfies GetServerSideProps;
