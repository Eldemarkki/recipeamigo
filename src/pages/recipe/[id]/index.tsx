import { GetServerSideProps } from "next";
import { getUserFromRequest } from "../../../utils/auth";
import { getSingleRecipe, increaseViewCountForRecipe } from "../../../database/recipes";
import { Ingredient, IngredientSection as IngredientSectionType, Recipe, UserProfile } from "@prisma/client";
import { ConvertDates } from "../../../utils/types";
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

export type RecipePageProps = {
  recipe: ConvertDates<Recipe> & {
    ingredientSections: (IngredientSectionType & {
      ingredients: Ingredient[];
    })[];
    user: UserProfile;
  },
  exportFileName: string,
};

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

export default function RecipePage({ recipe, exportFileName }: RecipePageProps) {
  const originalQuantity = recipe.quantity;

  const [recipeAmount, setRecipeAmount] = useState(recipe.quantity);

  const timeEstimateType = getTimeEstimateType(recipe.timeEstimateMinimumMinutes, recipe.timeEstimateMaximumMinutes);

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
              Export
            </Button>
            <LinkButton href={`/recipe/${recipe.id}/edit`}>
              Edit
            </LinkButton>
          </div>
        </div>
        <p>Created by <Link href={`/user/${recipe.user.username}`}>{recipe.user.username}</Link> - Viewed {recipe.viewCount} {recipe.viewCount === 1 ? "time" : "times"}</p>
        {timeEstimateType !== null && (timeEstimateType === "single" ?
          <p>Time estimate: {recipe.timeEstimateMinimumMinutes} minutes</p> :
          <p>Time estimate: {recipe.timeEstimateMinimumMinutes} - {recipe.timeEstimateMaximumMinutes} minutes</p>)
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
        <h2 className={styles.ingredientsTitle}>Ingredients</h2>
        {recipe.ingredientSections.map((section) => <IngredientSection
          key={section.id}
          section={section}
          recipeQuantity={recipeAmount}
          originalRecipeQuantity={originalQuantity}
        />)}
      </div>
      <div className={styles.instructionsContainer}>
        <h2 className={styles.instructionsTitle}>Instructions</h2>
        <InstructionsList instructions={recipe.instructions} />
      </div>
    </div>
  </main>;
}

export const getServerSideProps: GetServerSideProps<RecipePageProps> = async (context) => {
  const recipeId = context.query.id;
  if (typeof recipeId !== "string" || recipeId.length === 0) {
    throw new Error("Recipe id is not a string. This should never happen.");
  }

  const user = await getUserFromRequest(context.req);
  const recipe = await getSingleRecipe(recipeId);

  if (!recipe) {
    return {
      notFound: true,
    };
  }

  if (recipe.isPublic) {
    await increaseViewCountForRecipe(recipeId);
    return {
      props: {
        recipe: {
          ...recipe,
          createdAt: recipe.createdAt.getTime(),
          updatedAt: recipe.updatedAt.getTime(),
        },
        exportFileName: filenamify(recipe.name, { replacement: "_" }),
      },
    };
  }

  // TODO: Check to make sure user is not allowed to view other people's private recipes
  if (user && (user.status === "No profile" || user.status === "OK")) {
    await increaseViewCountForRecipe(recipeId);
    return {
      props: {
        recipe: {
          ...recipe,
          createdAt: recipe.createdAt.getTime(),
          updatedAt: recipe.updatedAt.getTime(),
        },
        exportFileName: filenamify(recipe.name + ".json", { replacement: "_" }),
      },
    };
  }

  return {
    redirect: {
      destination: "/login",
      permanent: false,
    },
  };
};
