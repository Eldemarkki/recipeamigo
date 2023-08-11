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
  const { t } = useTranslation("recipeView");
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

    if (response.ok) {
      setRecipeCollections(collectionIds);
      setDialogOpen(false);
    } else {
      console.error("Error while trying to add recipe to collections");
    }
  };

  return (
    <>
      <Dialog
        open={dialogOpen}
        onClickOutside={() => {
          setDialogOpen(false);
        }}
        maxWidth={800}
      >
        <AddRecipeToCollectionDialog
          collections={collections}
          onAdd={(ids) => {
            void addRecipeToCollections(ids);
          }}
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
