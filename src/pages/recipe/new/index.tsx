import { PageWrapper } from "../../../components/misc/PageWrapper";
import { RecipeForm } from "../../../components/recipeEngine/RecipeForm";
import type { createRecipe } from "../../../database/recipes";
import type { createRecipeSchema } from "../../../handlers/recipes/recipesPostHandler";
import { useErrorToast } from "../../../hooks/useErrorToast";
import { getUserFromRequest } from "../../../utils/auth";
import { HttpError, isKnownHttpStatusCode } from "../../../utils/errors";
import type { GetServerSideProps } from "next";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
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

  const data = (await response.json()) as {
    recipe: Awaited<ReturnType<typeof createRecipe>>;
    coverImageUploadUrl: string;
  };

  if (data.coverImageUploadUrl) {
    await fetch(data.coverImageUploadUrl, {
      method: "PUT",
      body: coverImage,
    });
  }

  return data.recipe;
};

export default function NewRecipePage() {
  const router = useRouter();
  const { showErrorToast } = useErrorToast();
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

export const getServerSideProps = (async ({ req, locale }) => {
  const user = await getUserFromRequest(req);
  if (user.status === "Unauthorized") {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  return {
    props: {
      ...(await serverSideTranslations(locale ?? "en")),
    },
  };
}) satisfies GetServerSideProps;
