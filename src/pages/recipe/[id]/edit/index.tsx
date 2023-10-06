import { PageWrapper } from "../../../../components/misc/PageWrapper";
import { RecipeForm } from "../../../../components/recipeEngine/RecipeForm";
import config from "../../../../config";
import { createPropsLoader } from "../../../../dataLoaders/loadProps";
import { editRecipePageDataLoader } from "../../../../dataLoaders/recipes/editRecipePageDataLoader";
import type {
  editRecipeSchema,
  recipesPutHandler,
} from "../../../../handlers/recipes/recipePutHandler";
import { useErrors } from "../../../../hooks/useErrors";
import { HttpError, isKnownHttpStatusCode } from "../../../../utils/errors";
import { formDataFromS3PostPolicy } from "../../../../utils/objectUtils";
import type { InferGetServerSidePropsType } from "next";
import { useTranslation } from "next-i18next";
import Head from "next/head";
import { useRouter } from "next/router";
import type { z } from "zod";

const editRecipe = async (
  recipeId: string,
  recipe: z.infer<typeof editRecipeSchema>,
  coverImage: File | null,
) => {
  const response = await fetch(`/api/recipes/${recipeId}`, {
    method: "PUT",
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
    ReturnType<typeof recipesPutHandler.handler>
  >;

  if (
    recipe.coverImageAction === "replace" &&
    data.coverImageUpload &&
    coverImage
  ) {
    await fetch(data.coverImageUpload.postURL, {
      method: "POST",
      body: formDataFromS3PostPolicy(
        data.coverImageUpload.formData,
        coverImage,
      ),
    });
  }
};

export default function EditRecipePage({
  recipe: initialRecipe,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter();
  const { showErrorToast } = useErrors();
  const { t } = useTranslation("recipeView");

  return (
    <>
      <Head>
        <title>
          {t("edit.title", { name: initialRecipe.name })} | {config.APP_NAME}
        </title>
      </Head>
      <PageWrapper>
        <RecipeForm
          type="edit"
          initialRecipe={initialRecipe}
          onSubmit={async (recipe, coverImage) => {
            try {
              await editRecipe(initialRecipe.id, recipe, coverImage);
              void router.push("/recipe/" + initialRecipe.id);
            } catch (error) {
              showErrorToast(error);
            }
          }}
        />
      </PageWrapper>
    </>
  );
}

export const getServerSideProps = createPropsLoader(editRecipePageDataLoader, [
  "common",
  "recipeView",
  "units",
  "errors",
  "tags",
]);
