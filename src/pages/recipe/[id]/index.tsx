import { LinkButton } from "../../../components/LinkButton";
import { Button } from "../../../components/button/Button";
import { ExportButton } from "../../../components/button/ExportButton";
import { AddToCollectionButton } from "../../../components/collections/AddToCollectionButton";
import { Link } from "../../../components/link/Link";
import { PageWrapper } from "../../../components/misc/PageWrapper";
import { IngredientSection } from "../../../components/recipeView/IngredientSection";
import { InstructionsList } from "../../../components/recipeView/InstructionsList";
import { RecipeQuantityPicker } from "../../../components/recipeView/RecipeQuantityPicker";
import { TagList } from "../../../components/recipeView/TagList";
import { loadProps } from "../../../dataLoaders/loadProps";
import { recipePageDataLoader } from "../../../dataLoaders/recipes/recipePageDataLoader";
import { useErrors } from "../../../hooks/useErrors";
import type { Locale } from "../../../i18next";
import { HttpError, isKnownHttpStatusCode } from "../../../utils/errors";
import { getTimeEstimateType } from "../../../utils/recipeUtils";
import styles from "./index.module.css";
import { Pencil1Icon } from "@radix-ui/react-icons";
import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { Trans, useTranslation } from "next-i18next";
import Head from "next/head";
import Image from "next/image";
import { useState } from "react";
import { FiPrinter } from "react-icons/fi";

export default function RecipePage(
  props: InferGetServerSidePropsType<typeof getServerSideProps>,
) {
  const { t, i18n } = useTranslation(["recipeView", "common"]);
  const { recipe, exportJsonFilename, exportMarkdownFilename } = props;
  const [likeCount, setLikeCount] = useState(props.likeCount);
  const [likeStatus, setLikeStatus] = useState(
    props.userId ? props.likeStatus : null,
  );
  const [recipeCollectionIds, setRecipeCollectionIds] = useState(
    props.collectionRelationships?.map((x) => x.recipeCollectionId) ?? [],
  );

  const originalQuantity = recipe.quantity;

  const likeRecipe = async () => {
    const response = await fetch(`/api/recipes/${recipe.id}/like`, {
      method: "POST",
    });

    if (!response.ok) {
      if (isKnownHttpStatusCode(response.status)) {
        throw new HttpError(response.statusText, response.status);
      } else {
        throw new Error("Error with status " + response.status);
      }
    }

    setLikeCount(likeCount + 1);
    setLikeStatus(true);
  };

  const unlikeRecipe = async () => {
    const response = await fetch(`/api/recipes/${recipe.id}/unlike`, {
      method: "POST",
    });
    if (!response.ok) {
      if (isKnownHttpStatusCode(response.status)) {
        throw new HttpError(response.statusText, response.status);
      } else {
        throw new Error("Error with status " + response.status);
      }
    }

    setLikeCount(likeCount - 1);
    setLikeStatus(false);
  };

  const { showErrorToast } = useErrors();

  const handleLikeButtonClick = async () => {
    try {
      if (likeStatus) {
        await unlikeRecipe();
      } else {
        await likeRecipe();
      }
    } catch (error) {
      showErrorToast(error);
    }
  };

  const [recipeAmount, setRecipeAmount] = useState(recipe.quantity);

  const timeEstimateType = getTimeEstimateType(
    recipe.timeEstimateMinimumMinutes,
    recipe.timeEstimateMaximumMinutes,
  );

  const locales: Record<Locale, string> = {
    en: "en_US",
    fi: "fi_FI",
  };

  return (
    <>
      <Head>
        <meta property="og:title" content={recipe.name} />
        <meta property="og:description" content={recipe.description} />
        <meta property="og:image" content={recipe.coverImageUrl} />
        {/* TODO: Add og:url */}
        <meta property="og:type" content="article" />
        <meta property="og:locale" content={locales[i18n.language as Locale]} />
        <meta property="og:site_name" content="Recipeamigo" />
        <meta
          property="article:published_time"
          content={recipe.createdAt.toISOString()}
        />
        <meta property="article:author" content={recipe.user.username} />
        <meta property="article:section" content="Food" />
        {recipe.tags.map((tag) => (
          <meta property="article:tag" content={tag.text} key={tag.order} />
        ))}
      </Head>
      <PageWrapper mainClass={styles.container} maxWidth={1000}>
        {recipe.coverImageUrl && (
          <div className={styles.coverImageContainer}>
            <Image
              className={styles.coverImage}
              src={recipe.coverImageUrl}
              alt=""
              fill
            />
          </div>
        )}
        <div className={styles.topRow}>
          <div className={styles.titleRow}>
            <h3 className={styles.title}>{recipe.name}</h3>
            <div className={styles.titleRowButtons}>
              {props.userId && (
                <AddToCollectionButton
                  collections={props.allCollections}
                  recipeVisibility={recipe.visibility}
                  recipeId={recipe.id}
                  selectedRecipeCollections={recipeCollectionIds}
                  setRecipeCollections={setRecipeCollectionIds}
                />
              )}
              <Button
                variant="secondary"
                onClick={() => {
                  window.print();
                }}
              >
                <FiPrinter />
                {t("common:actions.print")}
              </Button>
              {props.userId && recipe.user.clerkId === props.userId && (
                <LinkButton
                  variant="secondary"
                  href={`/recipe/${recipe.id}/edit`}
                  icon={<Pencil1Icon />}
                >
                  {t("common:actions.edit")}
                </LinkButton>
              )}
              <ExportButton
                recipe={recipe}
                exportJsonFilename={exportJsonFilename}
                exportMarkdownFilename={exportMarkdownFilename}
              />
            </div>
          </div>
          {recipe.tags.length > 0 && <TagList tags={recipe.tags} />}
          <div>
            <Trans
              i18nKey="recipeView:line"
              username={recipe.user.username}
              count={recipe.viewCount}
            >
              Created by{" "}
              <Link href={`/user/${recipe.user.username}`}>
                {/* @ts-expect-error, https://github.com/i18next/react-i18next/issues/1543, https://github.com/i18next/react-i18next/issues/1504 */}
                {{ username: recipe.user.username }}
              </Link>{" "}
              - Viewed {{ count: recipe.viewCount }}{" "}
              {recipe.viewCount === 1 ? "time" : "times"}
            </Trans>
          </div>
          {props.userId && recipe.user.clerkId !== props.userId && (
            <Button
              className={styles.likeButton}
              variant="secondary"
              onClick={() => {
                void handleLikeButtonClick();
              }}
            >
              {likeStatus
                ? t("recipeView:likes.unlikeButton")
                : t("recipeView:likes.likeButton")}
            </Button>
          )}
          <p>{t("recipeView:likes.likeCountText", { count: likeCount })}</p>
          {timeEstimateType !== null &&
            (timeEstimateType === "single" ? (
              <p>
                {t("recipeView:timeEstimate.single", {
                  count: recipe.timeEstimateMinimumMinutes,
                })}
              </p>
            ) : (
              <p>
                {t("recipeView:timeEstimate.range", {
                  min: recipe.timeEstimateMinimumMinutes,
                  max: recipe.timeEstimateMaximumMinutes,
                })}
              </p>
            ))}
          <p>{recipe.description}</p>
        </div>
        <div className={styles.recipeQuantityPickerContainer}>
          <RecipeQuantityPicker
            quantity={recipeAmount}
            onChange={setRecipeAmount}
          />
        </div>
        <div className={styles.splitContainer}>
          <div className={styles.ingredientsContainer}>
            <h2>{t("recipeView:ingredients.title")}</h2>
            {recipe.ingredientSections.length ? (
              <ul>
                {recipe.ingredientSections.map((section) => (
                  <li key={section.id}>
                    <IngredientSection
                      section={section}
                      recipeQuantity={recipeAmount}
                      originalRecipeQuantity={originalQuantity}
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <p>{t("recipeView:ingredients.noIngredients")}</p>
            )}
          </div>
          <div className={styles.instructionsContainer}>
            <h2>{t("recipeView:instructions.title")}</h2>
            <InstructionsList instructions={recipe.instructions} />
          </div>
        </div>
      </PageWrapper>
    </>
  );
}

export const getServerSideProps = ((ctx) =>
  loadProps({
    ctx,
    requiredTranslationNamespaces: ["common", "recipeView", "tags", "errors"],
    ...recipePageDataLoader,
  })) satisfies GetServerSideProps;
