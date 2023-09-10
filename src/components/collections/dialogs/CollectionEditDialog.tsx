import type { getCollection } from "../../../database/collections";
import type { editCollection as editCollectionApi } from "../../../database/collections";
import type { getAllRecipesForUser } from "../../../database/recipes";
import type { editCollectionSchema } from "../../../handlers/collections/collectionsIdPutHandler";
import { useLoadingState } from "../../../hooks/useLoadingState";
import { isValidVisibilityConfiguration } from "../../../utils/collectionUtils";
import { LinkButton } from "../../LinkButton";
import { RecipeSelectionGrid } from "../../RecipeSelectionGrid";
import { Select } from "../../Select";
import { Button } from "../../button/Button";
import { ErrorText } from "../../error/ErrorText";
import styles from "./CollectionEditDialog.module.css";
import { RecipeCollectionVisibility } from "@prisma/client";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { useId, useState } from "react";
import type { z } from "zod";

const editCollection = async (
  collectionId: string,
  collection: z.infer<typeof editCollectionSchema>,
) => {
  const response = await fetch(`/api/collections/${collectionId}`, {
    method: "PUT",
    body: JSON.stringify(collection),
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as Awaited<
    ReturnType<typeof editCollectionApi>
  >;

  return data;
};

export type CollectionEditDialogProps = {
  collection: Exclude<Awaited<ReturnType<typeof getCollection>>, null>;
  allRecipes: Awaited<ReturnType<typeof getAllRecipesForUser>>;
  onClose: () => void;
};

export const CollectionEditDialog = ({
  collection,
  allRecipes,
  onClose,
}: CollectionEditDialogProps) => {
  const { t } = useTranslation(["collections", "home", "common"]);
  const router = useRouter();

  const [collectionName, setCollectionName] = useState(collection.name);
  const [description, setDescription] = useState(collection.description ?? "");
  const [visibility, setVisibility] = useState<RecipeCollectionVisibility>(
    collection.visibility,
  );
  const [selectedRecipeIds, setSelectedRecipeIds] = useState<string[]>(
    collection.RecipesOnCollections.map((r) => r.recipeId),
  );
  const { isLoading, startLoading, stopLoading } = useLoadingState();

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
    [RecipeCollectionVisibility.PRIVATE]: t(
      "home:collections.visibility.private",
    ),
    [RecipeCollectionVisibility.PUBLIC]: t(
      "home:collections.visibility.public",
    ),
    [RecipeCollectionVisibility.UNLISTED]: t(
      "home:collections.visibility.unlisted",
    ),
  };

  const visibilitySelectId = useId();
  const descriptionId = useId();

  const { isValid: validVisibilityConfiguration, violatingRecipes } =
    isValidVisibilityConfiguration(visibility, selectedRecipes);

  return (
    <form
      className={styles.container}
      onSubmit={(e) => {
        e.preventDefault();
        if (selectedRecipeIds.length === 0) {
          return;
        }

        void (async () => {
          startLoading();
          try {
            const editedCollection = await editCollection(collection.id, {
              name: collectionName,
              recipeIds: selectedRecipeIds,
              visibility,
              description,
            });

            if (editedCollection) {
              onClose();
              void router.push(`/collections/${editedCollection.id}`);
            } else {
              // TODO: Show error message
              console.error("Failed to edit collection");
            }
          } catch {
            console.error("Failed to edit collection");
          }
          stopLoading();
        })();
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
          placeholder={t("home:collections.newCollectionNamePlaceholder")}
        />
      </h1>
      <div>
        <label htmlFor={descriptionId}>
          {t("home:collections.descriptionLabel")}
        </label>
        <textarea
          className={styles.descriptionInput}
          id={descriptionId}
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
          }}
          placeholder={t("home:collections.descriptionPlaceholder")}
        />
      </div>
      <div className={styles.visibilityContainer}>
        <label htmlFor={visibilitySelectId}>
          {t("home:collections.newCollectionVisibility")}
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
          placeholder={t("home:collections.searchPlaceholder")}
          value={recipeFilter}
          onChange={(e) => {
            setRecipeFilter(e.target.value);
          }}
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
            onClickSelect: () => {
              setSelectedRecipeIds((selectedRecipes) => {
                if (selectedRecipes.includes(r.id)) {
                  return selectedRecipes.filter((id) => id !== r.id);
                } else {
                  return [...selectedRecipes, r.id];
                }
              });
            },
          }))}
        />
      ) : (
        <div className={styles.noResultsContainer}>
          {hasAnyRecipes ? (
            <span>
              {t("home:collections.noRecipesFound", { query: recipeFilter })}
            </span>
          ) : (
            <>
              <span>{t("home:collections.noRecipesExist")}</span>
              <LinkButton href="/recipe/new">
                {t("home:collections.noRecipesExistCreate")}
              </LinkButton>
            </>
          )}
        </div>
      )}
      {!validVisibilityConfiguration && (
        <ErrorText>
          {/* TODO: Different message if collection is already public and the user is trying to add private recipes */}
          {
            {
              [RecipeCollectionVisibility.PRIVATE]: null,
              [RecipeCollectionVisibility.PUBLIC]: t(
                "collections:edit.invalidVisibilityConfiguration.public",
                {
                  violatingRecipes: violatingRecipes.map((r) => r.name),
                },
              ),
              [RecipeCollectionVisibility.UNLISTED]: t(
                "collections:edit.invalidVisibilityConfiguration.unlisted",
                {
                  violatingRecipes: violatingRecipes.map((r) => r.name),
                },
              ),
            }[visibility]
          }
        </ErrorText>
      )}
      <div className={styles.buttonsContainer}>
        <Button variant="secondary" onClick={onClose}>
          {t("common:actions.cancel")}
        </Button>
        <Button
          type="submit"
          disabled={
            selectedRecipeIds.length === 0 ||
            !collectionName ||
            !validVisibilityConfiguration
          }
          loading={isLoading}
        >
          {t("common:actions.save")}
        </Button>
      </div>
    </form>
  );
};
