import { Recipe, RecipeVisibility } from "@prisma/client";
import { getUserFromRequest } from "./auth";

type TimeEstimateType = null | "single" | "range";

export const getTimeEstimateType = (
  min: number,
  max: number | null,
): TimeEstimateType => {
  if (min === 0 && max === null) {
    return null;
  }
  if (max === null || min === max) {
    return "single";
  }
  return "range";
};

export const splitSeconds = (totalSeconds: number) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds - hours * 3600) / 60);
  const seconds = totalSeconds - hours * 3600 - minutes * 60;

  return {
    hours,
    minutes,
    seconds,
  };
};

export const hasReadAccessToRecipe = (
  user: Awaited<ReturnType<typeof getUserFromRequest>>,
  recipe: Recipe,
) => {
  if (
    recipe.visibility === RecipeVisibility.PUBLIC ||
    recipe.visibility === RecipeVisibility.UNLISTED
  ) {
    return true;
  }

  if (recipe.visibility === RecipeVisibility.PRIVATE) {
    if (user.status === "Unauthorized") {
      return false;
    }

    return recipe.userId === user.userId;
  }

  return false;
};
