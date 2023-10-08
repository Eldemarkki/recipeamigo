import { LinkButton } from "../../../components/LinkButton";
import { Button } from "../../../components/button/Button";
import { ExportButton } from "../../../components/button/ExportButton";
import { AddToCollectionButton } from "../../../components/collections/AddToCollectionButton";
import { Link } from "../../../components/link/Link";
import { PageWrapper } from "../../../components/misc/PageWrapper";
import { VisibilityText } from "../../../components/misc/VisibilityText";
import { IngredientSection } from "../../../components/recipeView/IngredientSection";
import { InstructionsList } from "../../../components/recipeView/InstructionsList";
import { RecipeQuantityPicker } from "../../../components/recipeView/RecipeQuantityPicker";
import { TagList } from "../../../components/recipeView/TagList";
import config from "../../../config";
import { createPropsLoader } from "../../../dataLoaders/loadProps";
import { recipePageDataLoader } from "../../../dataLoaders/recipes/recipePageDataLoader";
import { useErrors } from "../../../hooks/useErrors";
import type { Locale } from "../../../i18next";
import { getErrorFromResponse } from "../../../utils/errors";
import { getTimeEstimateType } from "../../../utils/recipeUtils";
import styles from "./index.module.css";
import {
  ClockIcon,
  EyeOpenIcon,
  HeartFilledIcon,
  Pencil1Icon,
  PersonIcon,
} from "@radix-ui/react-icons";
import type { InferGetServerSidePropsType } from "next";
import { useTranslation } from "next-i18next";
import Head from "next/head";
import Image from "next/image";
import { useState } from "react";
import { FiPrinter } from "react-icons/fi";
import { HiMiniHandThumbUp, HiMiniHandThumbDown } from "react-icons/hi2";

export default function RecipePage(
  props: InferGetServerSidePropsType<typeof getServerSideProps>,
) {
  const { t, i18n } = useTranslation(["recipeView", "common"]);
  const { recipe, exportJsonFilename, exportMarkdownFilename } = props;
  const [likeCount, setLikeCount] = useState(props.recipe._count.likes);
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
      return getErrorFromResponse(response);
    }

    setLikeCount(likeCount + 1);
    setLikeStatus(true);
  };

  const unlikeRecipe = async () => {
    const response = await fetch(`/api/recipes/${recipe.id}/unlike`, {
      method: "POST",
    });

    if (!response.ok) {
      return getErrorFromResponse(response);
    }

    setLikeCount(likeCount - 1);
    setLikeStatus(false);
  };

  const { showErrorToast } = useErrors();

  const [likeLoading, setLikeLoading] = useState(false);

  const handleLikeButtonClick = async () => {
    setLikeLoading(true);
    const error = await (likeStatus ? unlikeRecipe() : likeRecipe());
    if (error) {
      showErrorToast(error.errorCode);
    }
    setLikeLoading(false);
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
        <meta property="og:site_name" content={config.APP_NAME} />
        <meta
          property="article:published_time"
          content={recipe.createdAt.toISOString()}
        />
        <meta property="article:author" content={recipe.user.username} />
        <meta property="article:section" content="Food" />
        {recipe.tags.map((tag) => (
          <meta property="article:tag" content={tag.text} key={tag.order} />
        ))}
        <title>{`${recipe.name} | ${config.APP_NAME}`}</title>
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
          <div className={styles.infoRow}>
            <VisibilityText type="recipe" visibility={recipe.visibility} />
            <span>{"\u2022"}</span>
            <Link href={`/user/${recipe.user.username}`} icon={<PersonIcon />}>
              {recipe.user.username}
            </Link>
            <span>{"\u2022"}</span>
            <span className={styles.viewCount}>
              <EyeOpenIcon />
              {recipe.viewCount}
            </span>
            {timeEstimateType !== null && (
              <>
                <span>{"\u2022"}</span>
                <span className={styles.timeEstimate}>
                  <ClockIcon />
                  {timeEstimateType === "single" ? (
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
                  )}
                </span>
              </>
            )}
            <span>{"\u2022"}</span>
            <span className={styles.likeCount}>
              <HeartFilledIcon />
              {likeCount}
            </span>
            {props.userId && recipe.user.clerkId !== props.userId && (
              <Button
                className={styles.likeButton}
                variant="secondary"
                size="small"
                onClick={() => {
                  void handleLikeButtonClick();
                }}
                icon={
                  likeStatus ? <HiMiniHandThumbDown /> : <HiMiniHandThumbUp />
                }
                loading={likeLoading}
              >
                {likeStatus
                  ? t("recipeView:likes.unlikeButton")
                  : t("recipeView:likes.likeButton")}
              </Button>
            )}
          </div>
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
              <ul className={styles.ingredientSectionList}>
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

export const getServerSideProps = createPropsLoader(recipePageDataLoader, [
  "common",
  "recipeView",
  "tags",
]);
