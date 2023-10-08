import { LinkButton } from "../../../components/LinkButton";
import { RecipeCardGrid } from "../../../components/RecipeCardGrid";
import { Link } from "../../../components/link/Link";
import { PageWrapper } from "../../../components/misc/PageWrapper";
import { VisibilityText } from "../../../components/misc/VisibilityText";
import config from "../../../config";
import { collectionPageDataLoader } from "../../../dataLoaders/collections/collectionPageDataLoader";
import { createPropsLoader } from "../../../dataLoaders/loadProps";
import styles from "./index.module.css";
import { PersonIcon } from "@radix-ui/react-icons";
import type { InferGetServerSidePropsType } from "next";
import { useTranslation } from "next-i18next";
import Head from "next/head";

export default function CollectionPage({
  collection,
  isOwner,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { t } = useTranslation(["common", "collections"]);

  return (
    <>
      <Head>
        <title>{`${collection.name} | ${config.APP_NAME}`}</title>
      </Head>
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
        <div className={styles.infoSection}>
          {collection.description && <p>{collection.description}</p>}
          <div className={styles.infoRow}>
            <VisibilityText
              type="collection"
              visibility={collection.visibility}
            />
            <span>{"\u2022"}</span>
            <Link
              href={`/user/${collection.user.username}`}
              icon={<PersonIcon />}
            >
              {collection.user.username}
            </Link>
            <span>{"\u2022"}</span>
            <span>
              {t("collections:recipeCount", {
                count: collection.RecipesOnCollections.length,
              })}
            </span>
          </div>
        </div>
        <hr />
        {collection.RecipesOnCollections.length ? (
          <RecipeCardGrid
            recipes={collection.RecipesOnCollections.map((r) => ({
              ...r.recipe,
              likeCount: r.recipe._count.likes,
            }))}
          />
        ) : (
          <p>{t("collections:emptyCollection")}</p>
        )}
      </PageWrapper>
    </>
  );
}

export const getServerSideProps = createPropsLoader(collectionPageDataLoader, [
  "common",
  "home",
  "recipeView",
  "collections",
]);
