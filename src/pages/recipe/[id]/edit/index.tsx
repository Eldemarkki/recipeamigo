import { PageWrapper } from "../../../../components/misc/PageWrapper";
import { RecipeForm } from "../../../../components/recipeEngine/RecipeForm";
import { getSingleRecipe } from "../../../../database/recipes";
import type { editRecipeSchema } from "../../../../handlers/recipes/recipePutHandler";
import { useErrorToast } from "../../../../hooks/useErrorToast";
import { getUserFromRequest } from "../../../../utils/auth";
import { HttpError, isKnownHttpStatusCode } from "../../../../utils/errors";
import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
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
    ReturnType<typeof editRecipe>
  > & {
    coverImageUploadUrl: string;
  };

  if (recipe.coverImageAction === "replace" && coverImage) {
    await fetch(data.coverImageUploadUrl, {
      method: "PUT",
      body: coverImage,
      headers: {
        "Content-Type": coverImage.type,
      },
    });
  }
};

export default function EditRecipePage({
  recipe: initialRecipe,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter();
  const { showErrorToast } = useErrorToast();

  return (
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
  );
}

export const getServerSideProps = (async ({ req, params, locale }) => {
  const user = await getUserFromRequest(req);
  if (user.status === "Unauthorized") {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  const recipeId = params?.id;
  if (!recipeId || typeof recipeId !== "string") {
    throw new Error("Invalid recipe id. This should never happen");
  }

  const recipe = await getSingleRecipe(recipeId);

  const hasAccess = recipe && recipe.userId === user.userId;
  if (!hasAccess) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      ...(await serverSideTranslations(locale ?? "en")),
      recipe,
    },
  };
}) satisfies GetServerSideProps;
