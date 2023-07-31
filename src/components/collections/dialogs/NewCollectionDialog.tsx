import { useTranslation } from "next-i18next";
import { getAllRecipesForUser } from "../../../database/recipes";
import { Dialog } from "../../dialog/Dialog";
import styles from "./NewCollectionDialog.module.css";
import { useRouter } from "next/router";
import { useId, useState } from "react";
import { RecipeSelectionGrid } from "../../RecipeSelectionGrid";
import { LinkButton } from "../../LinkButton";
import { Button } from "../../button/Button";
import { z } from "zod";
import { createCollectionSchema } from "../../../pages/api/collections";
import { createCollection as createCollectionApi } from "../../../database/collections";
import { RecipeCollectionVisibility, RecipeVisibility } from "@prisma/client";
import { Select } from "../../Select";
import { ErrorText } from "../../error/ErrorText";

const createCollection = async (
  collection: z.infer<typeof createCollectionSchema>,
) => {
  const response = await fetch("/api/collections", {
    method: "POST",
    body: JSON.stringify(collection),
    headers: {
      "Content-Type": "application/json",
    },
  });

  const data = (await response.json()) as Awaited<
    ReturnType<typeof createCollectionApi>
  >;

  return data;
};

export type NewCollectionDialogProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  allRecipes: Awaited<ReturnType<typeof getAllRecipesForUser>>;
};

export const NewCollectionDialog = ({
  isOpen,
  setIsOpen,
  allRecipes,
}: NewCollectionDialogProps) => {
  const { t } = useTranslation("home");
  const router = useRouter();

  const [collectionName, setCollectionName] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<RecipeCollectionVisibility>(
    RecipeCollectionVisibility.PRIVATE,
  );
  const [selectedRecipeIds, setSelectedRecipeIds] = useState<string[]>([]);

  const selectedRecipes = allRecipes.filter((r) =>
    selectedRecipeIds.includes(r.id),
  );

  // TODO: Allow searching all recipes, not just your own ones.
  const [recipeFilter, setRecipeFilter] = useState("");

  const recipes = allRecipes.filter((r) =>
    r.name.toLocaleLowerCase().includes(recipeFilter.toLowerCase()),
  );

  const hasAnyRecipes = allRecipes.length > 0;

  const visibilityLabelMap: Record<RecipeCollectionVisibility, string> = {
    [RecipeCollectionVisibility.PRIVATE]: t("collections.visibility.private"),
    [RecipeCollectionVisibility.PUBLIC]: t("collections.visibility.public"),
    [RecipeCollectionVisibility.UNLISTED]: t("collections.visibility.unlisted"),
  };

  const visibilitySelectId = useId();
  const descriptionId = useId();

  // If the visibility is public, all recipes must be public or unlisted
  const validVisibilityConfiguration =
    visibility === RecipeCollectionVisibility.PUBLIC
      ? selectedRecipes.every(
          (r) =>
            r.visibility === RecipeCollectionVisibility.PUBLIC ||
            r.visibility === RecipeCollectionVisibility.UNLISTED,
        )
      : true;

  return (
    <Dialog open={isOpen} onClickOutside={() => setIsOpen(false)}>
      <form
        className={styles.container}
        onSubmit={async (e) => {
          e.preventDefault();
          if (selectedRecipeIds.length === 0) {
            return;
          }

          const collection = await createCollection({
            name: collectionName,
            recipeIds: selectedRecipeIds,
            visibility,
            description,
          });

          router.push(`/collections/${collection.id}`);
        }}
      >
        <h1>
          <input
            required
            minLength={1}
            className={styles.collectionNameInput}
            type="text"
            value={collectionName}
            onChange={(e) => {
              setCollectionName(e.target.value);
            }}
            placeholder={t("collections.newCollectionNamePlaceholder")}
          />
        </h1>
        <div>
          <label htmlFor={descriptionId}>
            {t("collections.descriptionLabel")}
          </label>
          <textarea
            className={styles.descriptionInput}
            id={descriptionId}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t("collections.descriptionPlaceholder")}
          />
        </div>
        <div className={styles.visibilityContainer}>
          <label htmlFor={visibilitySelectId}>
            {t("collections.newCollectionVisibility")}
          </label>
          <Select
            inputId={visibilitySelectId}
            value={{
              value: visibility,
              label: visibilityLabelMap[visibility],
            }}
            options={Object.entries(RecipeCollectionVisibility).map(
              ([, value]) => ({
                label: visibilityLabelMap[value],
                value,
              }),
            )}
            onChange={(option) => {
              if (option) {
                setVisibility(option.value);
              }
            }}
          />
        </div>
        {hasAnyRecipes && (
          <input
            className={styles.search}
            type="text"
            placeholder={t("collections.searchPlaceholder")}
            value={recipeFilter}
            onChange={(e) => setRecipeFilter(e.target.value)}
          />
        )}
        {recipes.length > 0 ? (
          <RecipeSelectionGrid
            recipes={recipes.map((r) => ({
              id: r.id,
              name: r.name,
              coverImageUrl: r.coverImageUrl,
              visibility: r.visibility,
              isSelected: selectedRecipeIds.includes(r.id),
              onClickSelect: () =>
                setSelectedRecipeIds((selectedRecipes) => {
                  if (selectedRecipes.includes(r.id)) {
                    return selectedRecipes.filter((id) => id !== r.id);
                  } else {
                    return [...selectedRecipes, r.id];
                  }
                }),
            }))}
          />
        ) : (
          <div className={styles.noResultsContainer}>
            {hasAnyRecipes ? (
              <span>
                {t("collections.noRecipesFound", { query: recipeFilter })}
              </span>
            ) : (
              <>
                <span>{t("collections.noRecipesExist")}</span>
                <LinkButton href="/recipe/new">
                  {t("collections.noRecipesExistCreate")}
                </LinkButton>
              </>
            )}
          </div>
        )}
        {!validVisibilityConfiguration && (
          <ErrorText>
            {t("collections.invalidVisibilityConfiguration", {
              privateRecipes: selectedRecipes
                .filter((r) => r.visibility === RecipeVisibility.PRIVATE)
                .map((r) => r.name),
            })}
          </ErrorText>
        )}
        <Button
          type="submit"
          disabled={
            selectedRecipeIds.length === 0 ||
            !collectionName ||
            !validVisibilityConfiguration
          }
        >
          {t("collections.createCollection", {
            count: selectedRecipeIds.length,
          })}
        </Button>
      </form>
    </Dialog>
  );
};
