import { z } from "zod";
import { createRecipeSchema } from "../../api/recipes";
import { useRouter } from "next/router";
import { createRecipe } from "../../../database/recipes";
import { GetServerSideProps } from "next";
import { getUserFromRequest } from "../../../utils/auth";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { RecipeForm } from "../../../components/recipeEngine/RecipeForm";

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
    <RecipeForm
      type="new"
      onSubmit={async (recipe, coverImage) => {
        // TODO: Show loading indicator while saving
        const savedRecipe = await saveRecipe(recipe, coverImage);
        if (savedRecipe) {
          router.push("/recipe/" + savedRecipe.id);
        } else {
          // TODO: Show a notification to the user that the recipe failed to save.
          console.log("Failed to save recipe");
        }
      }}
    />
  );
}

export const getServerSideProps: GetServerSideProps<{}> = async ({
  req,
  locale,
}) => {
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
};
