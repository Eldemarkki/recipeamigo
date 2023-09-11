import type { getSingleRecipeWithoutCoverImageUrl } from "../database/recipes";
import type { Locale } from "../i18next";
import { getIngredientText } from "../ingredients/ingredientTranslator";
import { getInstructionText, getTimeEstimateType } from "./recipeUtils";

export const recipeToMarkdown = (
  recipe: Exclude<
    Awaited<ReturnType<typeof getSingleRecipeWithoutCoverImageUrl>>,
    null
  >,
  locale: Locale,
) => {
  let markdown = "";

  markdown += "---";
  markdown += `\nid: ${recipe.id}`;
  markdown += `\nname: ${recipe.name}`;
  markdown += `\ndescription: ${recipe.description}`;
  markdown += `\nquantity: ${recipe.quantity}`;
  markdown += `\nvisibility: ${recipe.visibility.toLowerCase()}`;
  markdown += `\ncreated: ${recipe.createdAt.toISOString()}`;
  markdown += `\nupdated: ${recipe.updatedAt.toISOString()}`;
  markdown += `\nauthor: ${recipe.user.username}`;

  if (recipe.tags.length) {
    markdown += `\ntags: ${[...recipe.tags]
      .sort((a, b) => a.order - b.order)
      .map((t) => t.text)
      .join(", ")}`;
  }

  markdown += `\nviews: ${recipe.viewCount}`;

  const timeEstimateType = getTimeEstimateType(
    recipe.timeEstimateMinimumMinutes,
    recipe.timeEstimateMaximumMinutes,
  );
  if (timeEstimateType === "single") {
    markdown += `\ntimeEstimate: ${recipe.timeEstimateMinimumMinutes}`;
  } else if (timeEstimateType === "range") {
    markdown += `\ntimeEstimate: ${recipe.timeEstimateMinimumMinutes}-${recipe.timeEstimateMaximumMinutes}`;
  }

  markdown += "\n---";

  markdown += `\n\n# ${recipe.name}`;

  if (recipe.description) {
    markdown += `\n\n${recipe.description}`;
  }

  if (recipe.ingredientSections.length) {
    markdown += `\n\n## Ingredients`;

    for (const section of recipe.ingredientSections) {
      markdown += `\n\n### ${section.name}`;

      if (section.ingredients.length) {
        markdown += "\n";
        for (const ingredient of section.ingredients) {
          markdown += `\n- ${getIngredientText(
            ingredient.name,
            ingredient.quantity,
            ingredient.unit,
            ingredient.isOptional,
            locale,
          )}`;
        }
      }
    }
  }

  if (recipe.instructions.length) {
    markdown += `\n\n## Instructions`;

    markdown += "\n";

    for (const instruction of recipe.instructions) {
      markdown += `\n${instruction.order + 1}. ${getInstructionText(
        instruction.description,
      )}`;
    }
  }

  markdown += "\n";

  return markdown;
};
