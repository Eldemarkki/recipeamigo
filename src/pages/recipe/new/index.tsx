import { PageWrapper } from "../../../components/misc/PageWrapper";
import { RecipeForm } from "../../../components/recipeEngine/RecipeForm";
import config from "../../../config";
import { createPropsLoader } from "../../../dataLoaders/loadProps";
import { newRecipePageDataLoader } from "../../../dataLoaders/recipes/newRecipePageDataLoader";
import type {
  createRecipeSchema,
  recipesPostHandler,
} from "../../../handlers/recipes/recipesPostHandler";
import { useErrors } from "../../../hooks/useErrors";
import { getErrorFromResponse } from "../../../utils/errors";
import { formDataFromS3PostPolicy } from "../../../utils/objectUtils";
import { useTranslation } from "next-i18next";
import Head from "next/head";
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
    return getErrorFromResponse(response);
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
  const { t } = useTranslation("recipeView");

  return (
    <>
      <Head>
        <title>{`${t("title")} | ${config.APP_NAME}`}</title>
      </Head>
      <PageWrapper>
        <RecipeForm
          type="new"
          onSubmit={async (recipe, coverImage) => {
            const savedRecipe = await saveRecipe(recipe, coverImage);
            if ("errorCode" in savedRecipe) {
              showErrorToast(savedRecipe.errorCode);
            } else {
              await router.push("/recipe/" + savedRecipe.id);
            }
          }}
        />
      </PageWrapper>
    </>
  );
}

export const getServerSideProps = createPropsLoader(newRecipePageDataLoader, [
  "common",
  "recipeView",
  "tags",
  "units",
]);
