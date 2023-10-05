import { LinkButton } from "../../../components/LinkButton";
import { RecipeCardGrid } from "../../../components/RecipeCardGrid";
import { PageWrapper } from "../../../components/misc/PageWrapper";
import { VisibilityText } from "../../../components/misc/VisibilityText";
import { collectionPageDataLoader } from "../../../dataLoaders/collections/collectionPageDataLoader";
import { createPropsLoader } from "../../../dataLoaders/loadProps";
import styles from "./index.module.css";
import type { InferGetServerSidePropsType } from "next";
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
      <div className={styles.infoRow}>
        <VisibilityText type="collection" visibility={collection.visibility} />
        <span>{"\u2022"}</span>
        <span>
          {t("collections:createdBy", { name: collection.user.username })}
        </span>
        <span>{"\u2022"}</span>
        <span>
          {t("collections:recipeCount", {
            count: collection.RecipesOnCollections.length,
          })}
        </span>
      </div>
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

export const getServerSideProps = createPropsLoader(collectionPageDataLoader, [
  "common",
  "home",
  "recipeView",
  "collections",
  "errors",
]);
