import { useState } from "react";
import { Button } from "./button/Button";
import { getAllRecipesForUser } from "../database/recipes";
import { useTranslation } from "next-i18next";
import { NewCollectionDialog } from "./collections/NewCollectionDialog";

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
