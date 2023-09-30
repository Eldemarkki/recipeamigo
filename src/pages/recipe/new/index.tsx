import { PageWrapper } from "../../../components/misc/PageWrapper";
import { RecipeForm } from "../../../components/recipeEngine/RecipeForm";
import { createPropsLoader } from "../../../dataLoaders/loadProps";
import { newRecipePageDataLoader } from "../../../dataLoaders/recipes/newRecipePageDataLoader";
import type {
  createRecipeSchema,
  recipesPostHandler,
} from "../../../handlers/recipes/recipesPostHandler";
import { useErrors } from "../../../hooks/useErrors";
import { HttpError, isKnownHttpStatusCode } from "../../../utils/errors";
import { formDataFromS3PostPolicy } from "../../../utils/objectUtils";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import type { z } from "zod";

const saveRecipe = async (
  recipe: z.infer<typeof createRecipeSchema>,
  coverImage: File | null,
) => {
  const response = await fetch("/api/recipes", {
    method: "POST",
    body: JSON.stringify(recipe),
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    if (isKnownHttpStatusCode(response.status)) {
      throw new HttpError(response.statusText, response.status);
    } else {
      throw new Error("Error with status " + response.status);
    }
  }

  const data = (await response.json()) as Awaited<
    ReturnType<typeof recipesPostHandler.handler>
  >;

  if (data.coverImageUpload && coverImage) {
    await fetch(data.coverImageUpload.postURL, {
      method: "POST",
      body: formDataFromS3PostPolicy(
        data.coverImageUpload.formData,
        coverImage,
      ),
    });
  }

  return data.recipe;
};

export default function NewRecipePage() {
  const router = useRouter();
  const { showErrorToast } = useErrors();
  const { t } = useTranslation("errors");

  return (
    <PageWrapper>
      <RecipeForm
        type="new"
        onSubmit={async (recipe, coverImage) => {
          try {
            const savedRecipe = await saveRecipe(recipe, coverImage);
            void router.push("/recipe/" + savedRecipe.id);
          } catch (e) {
            showErrorToast(e, {
              400: t("createRecipe.400"),
            });
          }
        }}
      />
    </PageWrapper>
  );
}

export const getServerSideProps = createPropsLoader(newRecipePageDataLoader, [
  "common",
  "recipeView",
  "tags",
  "units",
  "errors",
]);
