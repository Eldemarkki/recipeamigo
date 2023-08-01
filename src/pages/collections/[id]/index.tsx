import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { queryParamToString } from "../../../utils/stringUtils";
import { getCollection } from "../../../database/collections";
import { getUserFromRequest } from "../../../utils/auth";
import { hasReadAccessToCollection } from "../../../utils/collectionUtils";
import { RecipeCardGrid } from "../../../components/RecipeCardGrid";
import styles from "./index.module.css";
import { useState } from "react";
import { Button } from "../../../components/button/Button";
import { Dialog } from "../../../components/dialog/Dialog";
import { CollectionEditDialog } from "../../../components/collections/dialogs/CollectionEditDialog";
import { getAllRecipesForUser } from "../../../database/recipes";
import { useTranslation } from "next-i18next";

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
          onClickOutside={() => setIsDialogOpen(false)}
        >
          <CollectionEditDialog
            collection={props.collection}
            allRecipes={props.allRecipes}
            onClose={() => setIsDialogOpen(false)}
          />
        </Dialog>
      )}
      <div className={styles.topRow}>
        <h1>{props.collection.name}</h1>
        {props.isOwner && (
          <Button onClick={() => setIsDialogOpen(true)}>
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

export const getServerSideProps = (async ({ req, locale, query }) => {
  const id = queryParamToString(query.id) ?? "";

  const collection = await getCollection(id);
  const user = await getUserFromRequest(req);

  if (!collection || !hasReadAccessToCollection(user, collection)) {
    return {
      notFound: true,
    };
  }

  const isOwner =
    user.status !== "Unauthorized" && user.userId === collection.userId;

  const allRecipes = isOwner ? await getAllRecipesForUser(user.userId) : null;

  const recipesAndOwner = isOwner
    ? ({
        allRecipes,
        isOwner: true,
      } as const)
    : ({
        isOwner: false,
      } as const);

  return {
    props: {
      ...(await serverSideTranslations(locale ?? "en", [
        "common",
        "home",
        "recipeView",
        "collections",
      ])),
      collection,
      ...recipesAndOwner,
    },
  };
}) satisfies GetServerSideProps;
