import { CountdownExtension } from "../components/recipeEngine/extensions/CountdownExtension";
import type { AuthorizedUser, getUserFromRequest } from "./auth";
import type { Recipe } from "@prisma/client";
import { RecipeVisibility } from "@prisma/client";
import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import { generateJSON } from "@tiptap/html";
import { generateText } from "@tiptap/react";

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
  user: Awaited<ReturnType<typeof getUserFromRequest>> | string | null,
  recipe: Recipe,
) => {
  if (
    recipe.visibility === RecipeVisibility.PUBLIC ||
    recipe.visibility === RecipeVisibility.UNLISTED
  ) {
    return true;
  }

  if (typeof user === "string") {
    // `user` is actually the userId
    return recipe.userId === user;
  }

  if (!user || user.status === "Unauthorized") {
    return false;
  }

  return recipe.userId === user.userId;
};

export const hasWriteAccessToRecipe = (
  userOrUserId: AuthorizedUser | string,
  recipe: Recipe,
) => {
  if (typeof userOrUserId === "string") {
    return recipe.userId === userOrUserId;
  } else {
    return recipe.userId === userOrUserId.userId;
  }
};

export const getInstructionText = (instructionHtml: string) => {
  const extensions = [Document, Paragraph, Text, CountdownExtension];
  const json = generateJSON(instructionHtml, extensions);
  const text = generateText(json, extensions);
  return text;
};
