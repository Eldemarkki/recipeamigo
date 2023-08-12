import { PageWrapper } from "../../../components/misc/PageWrapper";
import { RecipeForm } from "../../../components/recipeEngine/RecipeForm";
import type { createRecipe } from "../../../database/recipes";
import type { createRecipeSchema } from "../../../handlers/recipes/recipesPostHandler";
import { getUserFromRequest } from "../../../utils/auth";
import type { GetServerSideProps } from "next";
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
    return null;
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

  return (
    <PageWrapper>
      <RecipeForm
        type="new"
        onSubmit={async (recipe, coverImage) => {
          // TODO: Show loading indicator while saving
          const savedRecipe = await saveRecipe(recipe, coverImage);
          if (savedRecipe) {
            void router.push("/recipe/" + savedRecipe.id);
          } else {
            // TODO: Show a notification to the user that the recipe failed to save.
            console.log("Failed to save recipe");
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
