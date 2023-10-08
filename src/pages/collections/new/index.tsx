import { LinkButton } from "../../../components/LinkButton";
import { RecipeSelectionGrid } from "../../../components/RecipeSelectionGrid";
import { Select } from "../../../components/Select";
import { Button } from "../../../components/button/Button";
import { ErrorText } from "../../../components/error/ErrorText";
import { PageWrapper } from "../../../components/misc/PageWrapper";
import config from "../../../config";
import { newCollectionPageDataLoader } from "../../../dataLoaders/collections/newCollectionPageDataLoader";
import { createPropsLoader } from "../../../dataLoaders/loadProps";
import type { createCollection as createCollectionApi } from "../../../database/collections";
import type { createCollectionSchema } from "../../../handlers/collections/collectionsPostHandler";
import { useErrors } from "../../../hooks/useErrors";
import { useLoadingState } from "../../../hooks/useLoadingState";
import {
  isValidVisibilityConfiguration,
  isVisibilityValidForCollection,
} from "../../../utils/collectionUtils";
import { getErrorFromResponse } from "../../../utils/errors";
import styles from "./index.module.css";
import { RecipeCollectionVisibility } from "@prisma/client";
import type { InferGetServerSidePropsType } from "next";
import { useTranslation } from "next-i18next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useId, useState } from "react";
import type { z } from "zod";

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

  if (!response.ok) {
    return getErrorFromResponse(response);
  }

  const data = (await response.json()) as Awaited<
    ReturnType<typeof createCollectionApi>
  >;

  return data;
};

export default function NewCollectionPage({
  allRecipes,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { t } = useTranslation(["home", "collections"]);
  const router = useRouter();
  const { showErrorToast } = useErrors();

  const [collectionName, setCollectionName] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<RecipeCollectionVisibility>(
    RecipeCollectionVisibility.PRIVATE,
  );
  const [selectedRecipeIds, setSelectedRecipeIds] = useState<string[]>([]);
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
    [RecipeCollectionVisibility.PRIVATE]: t("collections.visibility.private"),
    [RecipeCollectionVisibility.PUBLIC]: t("collections.visibility.public"),
    [RecipeCollectionVisibility.UNLISTED]: t("collections.visibility.unlisted"),
  };

  const visibilitySelectId = useId();
  const descriptionId = useId();

  const { isValid: validVisibilityConfiguration, violatingRecipes } =
    isValidVisibilityConfiguration(visibility, selectedRecipes);

  return (
    <>
      <Head>
        <title>
          {`${t("collections:pageTitles.new")} | ${config.APP_NAME}`}
        </title>
      </Head>
      <PageWrapper title={t("collections:new.title")}>
        <form
          className={styles.container}
          onSubmit={(e) => {
            e.preventDefault();
            if (selectedRecipeIds.length === 0) {
              return;
            }

            void (async () => {
              startLoading();
              const collection = await createCollection({
                name: collectionName,
                recipeIds: selectedRecipeIds,
                visibility,
                description,
              });

              if ("errorCode" in collection) {
                showErrorToast(collection.errorCode);
              } else {
                void router.push(`/collections/${collection.id}`);
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
              onChange={(e) => {
                setDescription(e.target.value);
              }}
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
                selectable:
                  selectedRecipeIds.includes(r.id) ||
                  isVisibilityValidForCollection(r.visibility, visibility),
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
              {
                {
                  [RecipeCollectionVisibility.PRIVATE]: null,
                  [RecipeCollectionVisibility.PUBLIC]: t(
                    "collections:new.invalidVisibilityConfiguration.public",
                    {
                      violatingRecipes: violatingRecipes.map((r) => r.name),
                    },
                  ),
                  [RecipeCollectionVisibility.UNLISTED]: t(
                    "collections:new.invalidVisibilityConfiguration.unlisted",
                    {
                      violatingRecipes: violatingRecipes.map((r) => r.name),
                    },
                  ),
                }[visibility]
              }
            </ErrorText>
          )}
          <Button
            type="submit"
            disabled={
              selectedRecipeIds.length === 0 ||
              !collectionName ||
              !validVisibilityConfiguration
            }
            loading={isLoading}
          >
            {t("collections.createCollection", {
              count: selectedRecipeIds.length,
            })}
          </Button>
        </form>
      </PageWrapper>
    </>
  );
}

export const getServerSideProps = createPropsLoader(
  newCollectionPageDataLoader,
  ["common", "collections", "home", "recipeView"],
);
