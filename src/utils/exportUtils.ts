import type { getSingleRecipeWithoutCoverImageUrl } from "../database/recipes";
import type { Locale } from "../i18next";
import { getIngredientText } from "../ingredients/ingredientTranslator";
import { getInstructionText } from "./recipeUtils";

export const recipeToMarkdown = (
  recipe: Exclude<
    Awaited<ReturnType<typeof getSingleRecipeWithoutCoverImageUrl>>,
    null
  >,
  locale: Locale,
) => {
  const markdown = `---
id: ${recipe.id}
name: ${recipe.name}
description: ${recipe.description}
visibility: ${recipe.visibility.toLowerCase()}
created: ${recipe.createdAt.toISOString()}
updated: ${recipe.updatedAt.toISOString()}
author: ${recipe.user.username}
tags: ${[...recipe.tags]
    .sort((a, b) => a.order - b.order)
    .map((t) => t.text)
    .join(", ")}
views: ${recipe.viewCount}
timeEstimate: ${recipe.timeEstimateMinimumMinutes}-${
    recipe.timeEstimateMaximumMinutes
  }
---

# ${recipe.name}

${recipe.description}

## Ingredients

${recipe.ingredientSections
  .map(
    (s) => `### ${s.name}

${s.ingredients
  .map(
    (ingredient) =>
      "- " +
      getIngredientText(
        ingredient.name,
        ingredient.quantity,
        ingredient.unit,
        ingredient.isOptional,
        locale,
      ),
  )
  .join("\n")}`,
  )
  .join("\n\n")}

## Instructions

${recipe.instructions
  .map(
    (instruction, index) =>
      `${index + 1}. ${getInstructionText(instruction.description)}`,
  )
  .join("\n")}
`;

  return markdown;
};
