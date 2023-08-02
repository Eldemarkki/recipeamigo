import { getAllRecipesForUser } from "../database/recipes";
import { Button } from "./button/Button";
import { NewCollectionDialog } from "./collections/dialogs/NewCollectionDialog";
import { useTranslation } from "next-i18next";
import { useState } from "react";

export type NewCollectionButtonProps = {
  recipes: Awaited<ReturnType<typeof getAllRecipesForUser>>;
};

export const NewCollectionButton = ({
  recipes: allRecipes,
}: NewCollectionButtonProps) => {
  const { t } = useTranslation("home");
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <NewCollectionDialog
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        allRecipes={allRecipes}
      />
      <Button variant="secondary" onClick={() => setIsOpen(true)}>
        {t("newCollectionButton")}
      </Button>
    </>
  );
};
