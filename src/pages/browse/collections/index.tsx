import { LinkButton } from "../../../components/LinkButton";
import { CollectionsList } from "../../../components/collections/CollectionsList";
import { PageWrapper } from "../../../components/misc/PageWrapper";
import { browseCollectionsDataLoader } from "../../../dataLoaders/browse/collections/browseCollectionsDataLoader";
import { loadProps } from "../../../dataLoaders/loadProps";
import styles from "./index.module.css";
import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { useTranslation } from "next-i18next";

export default function BrowseCollectionsPage({
  publicCollections,
  userCollections,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { t } = useTranslation("browse");

  return (
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
          <h2>{t("collections.myCollections")}</h2>
          <CollectionsList collections={userCollections} />
        </div>
      )}
      <div className={styles.collectionSection}>
        <h2>{t("collections.publicCollections")}</h2>
        <CollectionsList collections={publicCollections} />
      </div>
    </PageWrapper>
  );
}

export const getServerSideProps = (async (ctx) =>
  await loadProps({
    ctx,
    ...browseCollectionsDataLoader,
  })) satisfies GetServerSideProps;
