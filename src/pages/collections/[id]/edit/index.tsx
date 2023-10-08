import { LinkButton } from "../../../../components/LinkButton";
import { RecipeSelectionGrid } from "../../../../components/RecipeSelectionGrid";
import { Select } from "../../../../components/Select";
import { Button } from "../../../../components/button/Button";
import { ConfirmationDialog } from "../../../../components/dialog/ConfirmationDialog";
import { ErrorText } from "../../../../components/error/ErrorText";
import { PageWrapper } from "../../../../components/misc/PageWrapper";
import config from "../../../../config";
import { collectionEditPageDataLoader } from "../../../../dataLoaders/collections/collectionEditPageDataLoader";
import { createPropsLoader } from "../../../../dataLoaders/loadProps";
import { type editCollection as editCollectionApi } from "../../../../database/collections";
import type { editCollectionSchema } from "../../../../handlers/collections/collectionsIdPutHandler";
import { useErrors } from "../../../../hooks/useErrors";
import { useLoadingState } from "../../../../hooks/useLoadingState";
import { isValidVisibilityConfiguration } from "../../../../utils/collectionUtils";
import { getErrorFromResponse } from "../../../../utils/errors";
import styles from "./index.module.css";
import { RecipeCollectionVisibility } from "@prisma/client";
import { TrashIcon } from "@radix-ui/react-icons";
import type { InferGetServerSidePropsType } from "next";
import { useTranslation } from "next-i18next";
import Head from "next/head";
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
    return getErrorFromResponse(response);
  }

  const data = (await response.json()) as Awaited<
    ReturnType<typeof editCollectionApi>
  >;

  return data;
};

const deleteCollection = async (collectionId: string) => {
  const response = await fetch(`/api/collections/${collectionId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    return getErrorFromResponse(response);
  }
};

export default function EditCollectionPage({
  collection,
  allRecipes,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { t } = useTranslation(["collections", "home", "common"]);
  const router = useRouter();
  const { getErrorMessage, showErrorToast } = useErrors();
  const [errorText, setErrorText] = useState<string | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

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
    <>
      <Head>
        <title>
          {`${t("collections:pageTitles.edit", { name: collection.name })} | ${
            config.APP_NAME
          }`}
        </title>
      </Head>
      <ConfirmationDialog
        isOpen={deleteDialogOpen}
        title={t("collections:edit.delete.title", { name: collection.name })}
        message={t("collections:edit.delete.message")}
        onCancel={() => {
          setDeleteDialogOpen(false);
        }}
        onConfirm={() => {
          void (async () => {
            const error = await deleteCollection(collection.id);
            if (error) {
              setDeleteDialogOpen(false);
              showErrorToast(error.errorCode);
            } else {
              await router.push("/browse/collections");
            }
          })();
        }}
        cancelButtonText={t("common:actions.cancel")}
        confirmButtonText={t("common:actions.delete")}
        cancelButtonVariant="secondary"
        confirmButtonVariant="danger"
      />
      <PageWrapper
        titleRow={
          <div className={styles.titleRow}>
            <h1>{t("edit.title", { name: collection.name })}</h1>
            <Button
              icon={<TrashIcon />}
              variant="danger"
              onClick={() => {
                setDeleteDialogOpen(true);
              }}
            >
              {t("common:actions.delete")}
            </Button>
          </div>
        }
      >
        <form
          className={styles.container}
          onSubmit={(e) => {
            e.preventDefault();
            if (selectedRecipeIds.length === 0) {
              return;
            }

            void (async () => {
              startLoading();
              setErrorText(null);

              const editedCollection = await editCollection(collection.id, {
                name: collectionName,
                recipeIds: selectedRecipeIds,
                visibility,
                description,
              });

              if ("errorCode" in editedCollection) {
                const message = getErrorMessage(editedCollection.errorCode);
                setErrorText(message);
              } else {
                void router.push(`/collections/${editedCollection.id}`);
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
                  {t("home:collections.noRecipesFound", {
                    query: recipeFilter,
                  })}
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
          {errorText && <ErrorText>{errorText}</ErrorText>}
          <div className={styles.buttonsContainer}>
            <Button
              type="submit"
              disabled={
                selectedRecipeIds.length === 0 ||
                !collectionName ||
                !validVisibilityConfiguration
              }
              loading={isLoading}
              style={{ minWidth: 100 }}
            >
              {t("common:actions.save")}
            </Button>
          </div>
        </form>
      </PageWrapper>
    </>
  );
}

export const getServerSideProps = createPropsLoader(
  collectionEditPageDataLoader,
  ["collections", "home", "common", "recipeView"],
);
