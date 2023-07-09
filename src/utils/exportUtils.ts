import { getSingleRecipeWithoutCoverImageUrl } from "../database/recipes";
import { Locale } from "../i18next";
import {
  getIngredientText,
  isIngredientType,
  unitsLocaleMap,
} from "../ingredients/ingredientTranslator";

export const recipeToMarkdown = (
  recipe: Exclude<
    Awaited<ReturnType<typeof getSingleRecipeWithoutCoverImageUrl>>,
    null
  >,
  locale: Locale
) => {
  let markdown = `---
id: ${recipe.id}
name: ${recipe.name}
description: ${recipe.description}
visibility: ${recipe.isPublic ? "public" : "private"}
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
  .map((ingredient) => {
    if (isIngredientType(ingredient.name)) {
      return (
        "- " +
        getIngredientText(
          ingredient.name,
          ingredient.quantity,
          ingredient.unit,
          locale
        )
      );
    }

    if (ingredient.unit === null) {
      return `- ${ingredient.quantity} ${ingredient.name}${
        ingredient.isOptional ? " (optional)" : ""
      }`;
    }

    const unit = unitsLocaleMap[locale][ingredient.unit].plural;

    // TODO: Improve this
    return `- ${ingredient.quantity} ${unit} ${ingredient.name}${
      ingredient.isOptional ? " (optional)" : ""
    }`;
  })
  .join("\n")}`
  )
  .join("\n\n")}

## Instructions

${recipe.instructions
  .map((instruction, index) => `${index + 1}. ${instruction.description}`)
  .join("\n")}
`;

  return markdown;
};
