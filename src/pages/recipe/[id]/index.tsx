import { GetServerSideProps } from "next";
import { getUserFromRequest } from "../../../utils/auth";
import { getSingleRecipe, increaseViewCountForRecipe } from "../../../database/recipes";
import { Ingredient, IngredientSection as IngredientSectionType, Recipe, UserProfile } from "@prisma/client";
import { ConvertDates } from "../../../utils/types";
import { useState } from "react";
import { RecipeQuantityPicker } from "../../../components/recipeView/RecipeQuantityPicker";
import { InstructionsList } from "../../../components/recipeView/InstructionsList";
import { IngredientSection } from "../../../components/recipeView/IngredientSection";
import Link from "next/link";
import styles from "./index.module.css";
import { LinkButton } from "../../../components/LinkButton";

export type RecipePageProps = {
  recipe: ConvertDates<Recipe> & {
    ingredientSections: (IngredientSectionType & {
      ingredients: Ingredient[];
    })[];
    user: UserProfile;
  }
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

export default function RecipePage({ recipe }: RecipePageProps) {
  const originalQuantity = recipe.quantity;

  const [recipeAmount, setRecipeAmount] = useState(recipe.quantity);

  const timeEstimateType = getTimeEstimateType(recipe.timeEstimateMinimumMinutes, recipe.timeEstimateMaximumMinutes);

  return <main className={styles.container}>
    <div className={styles.topRow}>
      <div>
        <div className={styles.titleRow}>
          <h3 className={styles.title}>{recipe.name}</h3>
          <LinkButton href={`/recipe/${recipe.id}/edit`}>
            Edit
          </LinkButton>
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
        }
      },
    };
  }

  if (user && (user.status === "No profile" || user.status === "OK")) {
    await increaseViewCountForRecipe(recipeId);
    return {
      props: {
        recipe: {
          ...recipe,
          createdAt: recipe.createdAt.getTime(),
          updatedAt: recipe.updatedAt.getTime(),
        }
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
