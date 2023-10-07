import { getErrorFromResponse } from "../../utils/errors";
import { Button } from "../button/Button";
import { Dialog } from "../dialog/Dialog";
import { AddRecipeToCollectionDialog } from "./dialogs/AddRecipeToCollectionDialog";
import type { RecipeCollection, RecipeVisibility } from "@prisma/client";
import { CardStackPlusIcon } from "@radix-ui/react-icons";
import { useTranslation } from "next-i18next";
import { useState } from "react";

export type AddToCollectionButtonProps = {
  collections: RecipeCollection[];
  selectedRecipeCollections: string[];
  setRecipeCollections: (collectionIds: string[]) => void;
  recipeVisibility: RecipeVisibility;
  recipeId: string;
};

export const AddToCollectionButton = ({
  collections,
  recipeVisibility,
  recipeId,
  setRecipeCollections,
  selectedRecipeCollections,
}: AddToCollectionButtonProps) => {
  const { t } = useTranslation(["recipeView", "collections"]);
  const [dialogOpen, setDialogOpen] = useState(false);

  const addRecipeToCollections = async (collectionIds: string[]) => {
    const response = await fetch(
      `/api/recipes/${recipeId}/add-to-collections`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          collectionIds,
        }),
      },
    );

    if (!response.ok) {
      return getErrorFromResponse(response);
    }

    setRecipeCollections(collectionIds);
    setDialogOpen(false);
  };

  return (
    <>
      <Dialog
        open={dialogOpen}
        closeDialog={() => {
          setDialogOpen(false);
        }}
        maxWidth={800}
        title={t("collections.title")}
      >
        <AddRecipeToCollectionDialog
          collections={collections}
          onAdd={addRecipeToCollections}
          recipeVisibility={recipeVisibility}
          selectedCollectionIds={selectedRecipeCollections}
        />
      </Dialog>
      <Button
        variant="secondary"
        icon={<CardStackPlusIcon />}
        onClick={() => {
          setDialogOpen(true);
        }}
      >
        {t("collections.addToCollectionButton")}
      </Button>
    </>
  );
};
