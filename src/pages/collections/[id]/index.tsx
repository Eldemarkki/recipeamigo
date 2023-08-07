import { RecipeCardGrid } from "../../../components/RecipeCardGrid";
import { Button } from "../../../components/button/Button";
import { CollectionEditDialog } from "../../../components/collections/dialogs/CollectionEditDialog";
import { Dialog } from "../../../components/dialog/Dialog";
import { collectionPageDataLoader } from "../../../dataLoaders/collections/collectionPageDataLoader";
import { loadProps } from "../../../dataLoaders/loadProps";
import styles from "./index.module.css";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { useTranslation } from "next-i18next";
import { useState } from "react";

export default function CollectionPage(
  props: InferGetServerSidePropsType<typeof getServerSideProps>,
) {
  const { t } = useTranslation("common");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <div>
      {props.isOwner && props.allRecipes && (
        <Dialog
          open={isDialogOpen}
          onClickOutside={() => {
            setIsDialogOpen(false);
          }}
        >
          <CollectionEditDialog
            collection={props.collection}
            allRecipes={props.allRecipes}
            onClose={() => {
              setIsDialogOpen(false);
            }}
          />
        </Dialog>
      )}
      <div className={styles.topRow}>
        <h1>{props.collection.name}</h1>
        {props.isOwner && (
          <Button
            onClick={() => {
              setIsDialogOpen(true);
            }}
          >
            {t("actions.edit")}
          </Button>
        )}
      </div>
      {props.collection.description && <p>{props.collection.description}</p>}
      <RecipeCardGrid
        recipes={props.collection.RecipesOnCollections.map((r) => r.recipe)}
      />
    </div>
  );
}

export const getServerSideProps = (async (ctx) =>
  await loadProps({
    ctx,
    ...collectionPageDataLoader,
  })) satisfies GetServerSideProps;
