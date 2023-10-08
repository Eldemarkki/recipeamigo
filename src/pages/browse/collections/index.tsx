import { LinkButton } from "../../../components/LinkButton";
import { CollectionsList } from "../../../components/collections/CollectionsList";
import { PageWrapper } from "../../../components/misc/PageWrapper";
import config from "../../../config";
import { browseCollectionsDataLoader } from "../../../dataLoaders/browse/collections/browseCollectionsDataLoader";
import { createPropsLoader } from "../../../dataLoaders/loadProps";
import styles from "./index.module.css";
import type { InferGetServerSidePropsType } from "next";
import { useTranslation } from "next-i18next";
import Head from "next/head";

export default function BrowseCollectionsPage({
  publicCollections,
  userCollections,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { t } = useTranslation("browse");

  return (
    <>
      <Head>
        <title>{`${t("pageTitle.collection")} | ${config.APP_NAME}`}</title>
      </Head>
      <PageWrapper
        titleRow={
          <div className={styles.titleRow}>
            <h1>{t("collections.title")}</h1>
            <LinkButton
              href="/collections/new"
              style={{
                width: "fit-content",
              }}
            >
              {t("collections.new")}
            </LinkButton>
          </div>
        }
        mainClass={styles.container}
      >
        {userCollections && (
          <div className={styles.collectionSection}>
            <h2>{t("collections.myCollections.title")}</h2>
            {userCollections.length > 0 ? (
              <CollectionsList collections={userCollections} />
            ) : (
              <p>{t("collections.myCollections.none")}</p>
            )}
          </div>
        )}
        <div className={styles.collectionSection}>
          <h2>{t("collections.publicCollections.title")}</h2>
          {publicCollections.length > 0 ? (
            <CollectionsList collections={publicCollections} />
          ) : (
            <p>{t("collections.publicCollections.none")}</p>
          )}
        </div>
      </PageWrapper>
    </>
  );
}
export const getServerSideProps = createPropsLoader(
  browseCollectionsDataLoader,
  ["common", "browse"],
);
