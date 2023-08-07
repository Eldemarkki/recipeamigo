import { LinkButton } from "../../../components/LinkButton";
import { Button } from "../../../components/button/Button";
import { ExportButton } from "../../../components/button/ExportButton";
import { Link } from "../../../components/link/Link";
import { IngredientSection } from "../../../components/recipeView/IngredientSection";
import { InstructionsList } from "../../../components/recipeView/InstructionsList";
import { RecipeQuantityPicker } from "../../../components/recipeView/RecipeQuantityPicker";
import { TagList } from "../../../components/recipeView/TagList";
import { getLikeCountForRecipe, getLikeStatus } from "../../../database/likes";
import {
  getSingleRecipe,
  increaseViewCountForRecipe,
} from "../../../database/recipes";
import { getUserFromRequest } from "../../../utils/auth";
import {
  getTimeEstimateType,
  hasReadAccessToRecipe,
} from "../../../utils/recipeUtils";
import styles from "./index.module.css";
import filenamify from "filenamify";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { Trans, useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Image from "next/image";
import { useState } from "react";

export default function RecipePage(
  props: InferGetServerSidePropsType<typeof getServerSideProps>,
) {
  const { t } = useTranslation();
  const { recipe, exportJsonFilename, exportMarkdownFilename } = props;
  const [likeCount, setLikeCount] = useState(props.likeCount);
  const [likeStatus, setLikeStatus] = useState(
    props.userId ? props.likeStatus : null,
  );

  const originalQuantity = recipe.quantity;

  const likeRecipe = async () => {
    const response = await fetch(`/api/recipes/${recipe.id}/like`, {
      method: "POST",
    });
    if (!response.ok) {
      // TODO: Show a notification to the user that the recipe liking failed
      console.log("Failed to like recipe");
      return;
    }
    setLikeCount(likeCount + 1);
    setLikeStatus(true);
  };

  const unlikeRecipe = async () => {
    const response = await fetch(`/api/recipes/${recipe.id}/unlike`, {
      method: "POST",
    });
    if (!response.ok) {
      // TODO: Show a notification to the user that the recipe unliking failed
      console.log("Failed to unlike recipe");
      return;
    }

    setLikeCount(likeCount - 1);
    setLikeStatus(false);
  };

  const [recipeAmount, setRecipeAmount] = useState(recipe.quantity);

  const timeEstimateType = getTimeEstimateType(
    recipe.timeEstimateMinimumMinutes,
    recipe.timeEstimateMaximumMinutes,
  );

  return (
    <main className={styles.container}>
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
        <div>
          <div className={styles.titleRow}>
            <h3 className={styles.title}>{recipe.name}</h3>
            <div className={styles.titleRowButtons}>
              {props.userId && recipe.user.clerkId === props.userId && (
                <LinkButton
                  variant="secondary"
                  href={`/recipe/${recipe.id}/edit`}
                >
                  {t("actions.edit")}
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
          {props.userId && recipe.user.clerkId !== props.userId && (
            <Button
              variant="secondary"
              onClick={() => {
                const fn = likeStatus === true ? unlikeRecipe : likeRecipe;
                void fn();
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
      </div>
      <div className={styles.splitContainer}>
        <div className={styles.ingredientsContainer}>
          <h2>{t("recipeView:ingredientsTitle")}</h2>
          {recipe.ingredientSections.map((section) => (
            <IngredientSection
              key={section.id}
              section={section}
              recipeQuantity={recipeAmount}
              originalRecipeQuantity={originalQuantity}
            />
          ))}
        </div>
        <div className={styles.instructionsContainer}>
          <h2>{t("recipeView:instructionsTitle")}</h2>
          <InstructionsList instructions={recipe.instructions} />
        </div>
      </div>
    </main>
  );
}

export const getServerSideProps = (async ({ query, req, locale }) => {
  const recipeId = query.id;
  if (typeof recipeId !== "string" || recipeId.length === 0) {
    throw new Error("Recipe id is not a string. This should never happen.");
  }

  const user = await getUserFromRequest(req);
  const recipe = await getSingleRecipe(recipeId);
  if (!recipe) {
    return {
      notFound: true,
    };
  }

  if (!hasReadAccessToRecipe(user, recipe)) {
    return {
      notFound: true,
    };
  }

  const likeCount = await getLikeCountForRecipe(recipeId);

  const likeStatusAndAnonymity:
    | {
        userId: null;
      }
    | {
        userId: string;
        likeStatus: boolean;
      } =
    user.status === "Unauthorized"
      ? {
          userId: null,
        }
      : {
          userId: user.userId,
          likeStatus: !!(await getLikeStatus(user.userId, recipeId)),
        };

  const exportJsonFilename = filenamify(recipe.name + ".json", {
    replacement: "_",
  });
  const exportMarkdownFilename = filenamify(recipe.name + ".md", {
    replacement: "_",
  });

  await increaseViewCountForRecipe(recipeId);

  return {
    props: {
      ...(await serverSideTranslations(locale ?? "en")),
      recipe,
      likeCount,
      exportJsonFilename,
      exportMarkdownFilename,
      ...likeStatusAndAnonymity,
    },
  };
}) satisfies GetServerSideProps;
