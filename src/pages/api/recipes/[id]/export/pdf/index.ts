import {
  isSpecialTagValue,
  tagTranslationKeys,
} from "../../../../../../components/tag/Tag";
import { getSingleRecipe } from "../../../../../../database/recipes";
import { getIngredientText } from "../../../../../../ingredients/ingredientTranslator";
import { getUserFromRequest } from "../../../../../../utils/auth";
import { getI18nClient } from "../../../../../../utils/getI18nClient";
import {
  getInstructionText,
  getTimeEstimateType,
  hasReadAccessToRecipe,
} from "../../../../../../utils/recipeUtils";
import { isLocale, locales } from "../../../../../../utils/stringUtils";
import type { NextApiHandler } from "next";
import { i18n } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import PDFDocument from "pdfkit";

const handler = (async (req, res) => {
  const id = req.query.id;
  if (id === undefined || Array.isArray(id)) {
    return;
  }

  if (req.method === "GET") {
    const user = await getUserFromRequest(req);
    const recipe = await getSingleRecipe(id);
    if (recipe === null) {
      res.status(404).end();
      return;
    }

    if (!hasReadAccessToRecipe(user, recipe)) {
      res.status(404).end();
      return;
    }

    const locale = req.query.locale;

    if (typeof locale !== "string" || !isLocale(locale)) {
      res.status(400).json({
        error: "Locale must be a string, allowed values: " + locales.join(", "),
      });
      return;
    }

    await serverSideTranslations(locale, ["common", "recipeView"]);
    const t = i18n?.t ?? (await getI18nClient(locale))?.t;
    if (!t) {
      console.log("Failed to get t function");
      res.status(500).end();
      return;
    }

    res.status(200);

    const doc = new PDFDocument({
      margin: 20,
    });

    doc.pipe(res);
    doc.font("Helvetica");

    if (recipe.coverImageUrl) {
      const imageResponse = await fetch(recipe.coverImageUrl);
      const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
      doc.image(imageBuffer, 100, undefined, {
        width: doc.page.width - 200,
        align: "center",
      });
    }

    doc.moveDown();
    doc.moveDown();

    doc.fontSize(24).text(recipe.name);
    doc.fontSize(12).text(recipe.description);
    doc.moveDown();

    doc.fontSize(12);

    const timeEstimateType = getTimeEstimateType(
      recipe.timeEstimateMinimumMinutes,
      recipe.timeEstimateMaximumMinutes,
    );

    if (timeEstimateType === "single") {
      doc.text(
        t("recipeView:timeEstimate.single", {
          count: recipe.timeEstimateMinimumMinutes,
        }),
      );
    } else if (timeEstimateType === "range") {
      doc.text(
        t("recipeView:timeEstimate.range", {
          min: recipe.timeEstimateMinimumMinutes,
          max: recipe.timeEstimateMaximumMinutes,
        }),
      );
    }

    doc.text(
      t("recipeView:export.createdAt", {
        val: recipe.createdAt,
        formatParams: {
          val: {
            year: "numeric",
            month: "long",
            day: "numeric",
          },
        },
      }),
    );
    doc.text(t("recipeView:export.author", { name: recipe.user.username }));
    doc.text(
      t("recipeView:export.tags", {
        tags: recipe.tags.map((tag) => {
          const text = tag.text;
          return isSpecialTagValue(text) ? t(tagTranslationKeys[text]) : text;
        }),
      }),
    );
    doc.text(t("recipeView:export.views", { count: recipe.viewCount }));

    doc.moveDown();
    doc.moveDown();

    doc.fontSize(18).text(t("recipeView:ingredients.title"));
    for (const section of recipe.ingredientSections) {
      doc.fontSize(14);
      doc.moveDown();
      doc.text(section.name);

      for (const ingredient of section.ingredients) {
        doc.fontSize(12);
        const ingredientText = getIngredientText(
          ingredient.name,
          ingredient.quantity,
          ingredient.unit,
          ingredient.isOptional,
          locale,
        );
        doc.text("• " + ingredientText, {
          indent: 10,
        });
      }
    }

    doc.moveDown();
    doc.moveDown();
    doc.fontSize(18).text(t("recipeView:instructions.title"));
    for (const instruction of recipe.instructions) {
      doc.fontSize(12);
      doc.text(
        `${instruction.order + 1}. ${getInstructionText(
          instruction.description,
        )}`,
        {
          indent: 10,
        },
      );
    }

    doc.end();

    return;
  }

  res.status(405).end();
}) satisfies NextApiHandler;

export default handler;
