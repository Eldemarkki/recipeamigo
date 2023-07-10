import { useState } from "react";
import { Button } from "./button/Button";
import { Dialog } from "./dialog/Dialog";
import { getAllRecipesForUser } from "../database/recipes";
import { RecipeSelectionGrid } from "./RecipeSelectionGrid";
import styles from "./NewCollectionButton.module.css";
import { LinkButton } from "./LinkButton";
import { useTranslation } from "next-i18next";

export type NewCollectionButtonProps = {
  recipes: Awaited<ReturnType<typeof getAllRecipesForUser>>;
};

export const NewCollectionButton = ({ recipes: allRecipes }: NewCollectionButtonProps) => {
  const { t } = useTranslation("home");

  const [isOpen, setIsOpen] = useState(false);
  const [selectedRecipes, setSelectedRecipes] = useState<string[]>([]);

  // TODO: Allow searching all recipes, not just your own ones.
  const [recipeFilter, setRecipeFilter] = useState("");

  const recipes = allRecipes.filter(r => r.name.toLocaleLowerCase().includes(recipeFilter.toLowerCase()));

  const hasAnyRecipes = allRecipes.length > 0;

  return <>
    <Dialog open={isOpen} onClickOutside={() => setIsOpen(false)}>
      <div className={styles.container}>
        <h1 className={styles.title}>{t("collections.newCollectionTitle")}</h1>
        {hasAnyRecipes && <input
          className={styles.search}
          type="text"
          placeholder={t("collections.searchPlaceholder")}
          value={recipeFilter}
          onChange={e => setRecipeFilter(e.target.value)}
        />}
        {recipes.length > 0
          ? <RecipeSelectionGrid recipes={recipes.map(r => ({
            id: r.id,
            name: r.name,
            coverImageUrl: r.coverImageUrl,
            isSelected: selectedRecipes.includes(r.id),
            onClickSelect: () => setSelectedRecipes(selectedRecipes => {
              if (selectedRecipes.includes(r.id)) {
                return selectedRecipes.filter(id => id !== r.id);
              } else {
                return [...selectedRecipes, r.id];
              }
            })
          }))} />
          : (<div className={styles.noResultsContainer}>
            {hasAnyRecipes
              ? <span>{t("collections.noRecipesFound", { query: recipeFilter })}</span>
              : <>
                <span>{t("collections.noRecipesExist")}</span>
                <LinkButton href="/recipe/new">{t("collections.noRecipesExistCreate")}</LinkButton>
              </>
            }
          </div>)}
        <Button
          onClick={() => {
            console.log("TODO: Create collection");
          }}
          disabled={selectedRecipes.length === 0}
        >
          {t("collections.createCollection", { count: selectedRecipes.length })}
        </Button>
      </div>
    </Dialog>
    <Button variant="secondary" onClick={() => setIsOpen(true)}>{t("newCollectionButton")}</Button>
  </>;
};
