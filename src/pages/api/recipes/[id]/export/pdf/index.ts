import { NextApiHandler } from "next";
import { getSingleRecipe } from "../../../../../../database/recipes";
import PDFDocument from "pdfkit";
import { isLocale, locales } from "../../../../../../utils/stringUtils";
import { getIngredientText } from "../../../../../../ingredients/ingredientTranslator";
import { getI18nClient } from "../../../../../../utils/getI18nClient";
import { getTimeEstimateType } from "../../../../../../utils/recipeUtils";
import {
  isSpecialTagValue,
  tagTranslationKeys,
} from "../../../../../../components/tag/Tag";
import { getUserFromRequest } from "../../../../../../utils/auth";

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

    if (user.status === "Unauthorized") {
      if (!recipe.isPublic) {
        res.status(404).end();
        return;
      }
    } else {
      if (recipe.userId !== user.userId) {
        res.status(404).end();
        return;
      }
    }

    const locale = req.query.locale;

    if (typeof locale !== "string" || !isLocale(locale)) {
      res.status(400).json({
        error: "Locale must be a string, allowed values: " + locales.join(", "),
      });
      return;
    }

    const t = (await getI18nClient(locale))?.t;

    if (!t) {
      console.log("Failed to get t function");
      res.status(500).end();
      return;
    }

    const doc = new PDFDocument({
      margin: 20,
    });
    res.status(200);

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

    doc.fontSize(18).text(t("recipeView:ingredientsTitle"));
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
    doc.fontSize(18).text(t("recipeView:instructionsTitle"));
    for (const instruction of recipe.instructions) {
      doc.fontSize(12);
      doc.text(instruction.order + 1 + ". " + instruction.description, {
        indent: 10,
      });
    }

    doc.end();

    return;
  }

  res.status(405).end();
}) satisfies NextApiHandler;

export default handler;
