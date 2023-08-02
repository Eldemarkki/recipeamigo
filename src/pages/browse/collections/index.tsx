import { CollectionsList } from "../../../components/collections/CollectionsList";
import {
  getPublicCollections,
  getUserCollections,
} from "../../../database/collections";
import { getUserFromRequest } from "../../../utils/auth";
import styles from "./index.module.css";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

export default function BrowseCollectionsPage({
  publicCollections,
  userCollections,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { t } = useTranslation("browse");

  return (
    <div className={styles.container}>
      <h1>{t("collections.title")}</h1>
      {userCollections && (
        <div className={styles.collectionSection}>
          <h2>{t("collections.myCollections")}</h2>
          <CollectionsList collections={userCollections} />
        </div>
      )}
      <div className={styles.collectionSection}>
        <h2>{t("collections.publicCollections")}</h2>
        <CollectionsList collections={publicCollections} />
      </div>
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
