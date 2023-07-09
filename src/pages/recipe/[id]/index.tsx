import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { getUserFromRequest } from "../../../utils/auth";
import { getSingleRecipe, increaseViewCountForRecipe } from "../../../database/recipes";
import { useState } from "react";
import { RecipeQuantityPicker } from "../../../components/recipeView/RecipeQuantityPicker";
import { InstructionsList } from "../../../components/recipeView/InstructionsList";
import { IngredientSection } from "../../../components/recipeView/IngredientSection";
import { Link } from "../../../components/link/Link";
import styles from "./index.module.css";
import { LinkButton } from "../../../components/LinkButton";
import filenamify from "filenamify";
import { Button } from "../../../components/button/Button";
import Image from "next/image";
import { getLikeCountForRecipe, getLikeStatus } from "../../../database/likes";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { Trans, useTranslation } from "next-i18next";
import { TagList } from "../../../components/recipeView/TagList";

type TimeEstimateType = null | "single" | "range";

const getTimeEstimateType = (min: number, max: number | null): TimeEstimateType => {
  if (min === 0 && max === null) {
    return null;
  }
  if (max === null || min === max) {
    return "single";
  }
  return "range";
};

const exportRecipe = (data: string, filename: string) => {
  const a = document.createElement("a");
  const url = URL.createObjectURL(new Blob([data], { type: "text/json" }));
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
};

export default function RecipePage(props: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { t } = useTranslation();
  const { recipe, exportFileName } = props;
  const [likeCount, setLikeCount] = useState(props.likeCount);
  const [likeStatus, setLikeStatus] = useState(props.userId ? props.likeStatus : null);

  const originalQuantity = recipe.quantity;

  const likeRecipe = async () => {
    fetch(`/api/recipes/${recipe.id}/like`, {
      method: "POST",
    });
    setLikeCount(likeCount + 1);
    setLikeStatus(true);
  };

  const unlikeRecipe = async () => {
    await fetch(`/api/recipes/${recipe.id}/unlike`, {
      method: "POST",
    });
    setLikeCount(likeCount - 1);
    setLikeStatus(false);
  };

  const [recipeAmount, setRecipeAmount] = useState(recipe.quantity);

  const timeEstimateType = getTimeEstimateType(recipe.timeEstimateMinimumMinutes ?? 0, recipe.timeEstimateMaximumMinutes);

  return <main className={styles.container}>
    {recipe.coverImageUrl && <div className={styles.coverImageContainer}>
      <Image
        className={styles.coverImage}
        src={recipe.coverImageUrl}
        alt=""
        fill
      />
    </div>}
    <div className={styles.topRow}>
      <div>
        <div className={styles.titleRow}>
          <h3 className={styles.title}>{recipe.name}</h3>
          <div className={styles.titleRowButtons}>
            <Button onClick={() => {
              exportRecipe(JSON.stringify({
                ...recipe,
                createdAt: new Date(recipe.createdAt),
                updatedAt: new Date(recipe.updatedAt),
              }), exportFileName);
            }}>
              {t("actions.export")}
            </Button>
            {props.userId && recipe.user.clerkId === props.userId && <LinkButton href={`/recipe/${recipe.id}/edit`}>
              {t("actions.edit")}
            </LinkButton>}
          </div>
        </div>
        {recipe.tags.length > 0 && <TagList tags={recipe.tags} />}
        <Trans i18nKey="recipeView:line" username={recipe.user.username} count={recipe.viewCount}>
          {/* @ts-ignore, https://github.com/i18next/react-i18next/issues/1543, https://github.com/i18next/react-i18next/issues/1504 */}
          Created by <Link href={`/user/${recipe.user.username}`}>{{ username: recipe.user.username }}</Link> - Viewed {{ count: recipe.viewCount }} {recipe.viewCount === 1 ? "time" : "times"}
        </Trans>
        {props.userId && recipe.user.clerkId !== props.userId &&
          <Button
            variant="secondary"
            onClick={likeStatus === true ? unlikeRecipe : likeRecipe}
          >
            {likeStatus ? t("recipeView:likes.likeButton") : t("recipeView:likes.unlikeButton")}
          </Button>}
        <p>{t("recipeView:likes.likeCountText", { count: likeCount })}</p>
        {timeEstimateType !== null && (timeEstimateType === "single" ?
          <p>{t("recipeView:timeEstimate.single", { count: recipe.timeEstimateMinimumMinutes })}</p> :
          <p>{t("recipeView:timeEstimate.range", { min: recipe.timeEstimateMinimumMinutes, max: recipe.timeEstimateMaximumMinutes })}</p>)
        }
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
        <h2 className={styles.ingredientsTitle}>{t("recipeView:ingredientsTitle")}</h2>
        {recipe.ingredientSections.map((section) => <IngredientSection
          key={section.id}
          section={section}
          recipeQuantity={recipeAmount}
          originalRecipeQuantity={originalQuantity}
        />)}
      </div>
      <div className={styles.instructionsContainer}>
        <h2 className={styles.instructionsTitle}>{t("recipeView:instructionsTitle")}</h2>
        <InstructionsList instructions={recipe.instructions} />
      </div>
    </div>
  </main>;
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

  const userIsRecipeOwner = user.status !== "Unauthorized" && user.userId === recipe.userId;
  if (recipe.isPublic === false && !userIsRecipeOwner) {
    return {
      notFound: true,
    };
  }

  const likeCount = await getLikeCountForRecipe(recipeId);

  const likeStatusAndAnonymity: ({
    userId: null,
  } | {
    userId: string,
    likeStatus: boolean,
  }) = user.status === "Unauthorized" ? {
    userId: null
  } : {
      userId: user.userId,
      likeStatus: !!(await getLikeStatus(user.userId, recipeId)),
    };

  if (recipe.isPublic) {
    await increaseViewCountForRecipe(recipeId);
    return {
      props: {
        ...(await serverSideTranslations(locale ?? "en")),
        recipe,
        likeCount,
        exportFileName: filenamify(recipe.name, { replacement: "_" }),
        ...likeStatusAndAnonymity
      },
    };
  }

  // TODO: Check to make sure user is not allowed to view other people's private recipes
  if (user && (user.status === "No profile" || user.status === "OK")) {
    await increaseViewCountForRecipe(recipeId);
    return {
      props: {
        ...(await serverSideTranslations(locale ?? "en")),
        recipe,
        likeCount,
        exportFileName: filenamify(recipe.name + ".json", { replacement: "_" }),
        ...likeStatusAndAnonymity
      },
    };
  }

  return {
    redirect: {
      destination: "/login",
      permanent: false,
    },
  };
}) satisfies GetServerSideProps;
