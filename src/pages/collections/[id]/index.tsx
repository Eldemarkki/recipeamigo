import { LinkButton } from "../../../components/LinkButton";
import { RecipeCardGrid } from "../../../components/RecipeCardGrid";
import { PageWrapper } from "../../../components/misc/PageWrapper";
import { collectionPageDataLoader } from "../../../dataLoaders/collections/collectionPageDataLoader";
import { loadProps } from "../../../dataLoaders/loadProps";
import styles from "./index.module.css";
import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { useTranslation } from "next-i18next";

export default function CollectionPage({
  collection,
  isOwner,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { t } = useTranslation(["common", "collections"]);

  return (
    <PageWrapper
      titleRow={
        <div className={styles.topRow}>
          <h1>{collection.name}</h1>
          {isOwner && (
            <LinkButton href={`/collections/${collection.id}/edit`}>
              {t("actions.edit")}
            </LinkButton>
          )}
        </div>
      }
    >
      {collection.description && <p>{collection.description}</p>}
      <hr />
      {collection.RecipesOnCollections.length ? (
        <RecipeCardGrid
          recipes={collection.RecipesOnCollections.map((r) => r.recipe)}
        />
      ) : (
        <p>{t("collections:emptyCollection")}</p>
      )}
    </PageWrapper>
  );
}

export const getServerSideProps = ((ctx) =>
  loadProps({
    ctx,
    requiredTranslationNamespaces: [
      "common",
      "home",
      "recipeView",
      "collections",
      "errors",
    ],
    ...collectionPageDataLoader,
  })) satisfies GetServerSideProps;
