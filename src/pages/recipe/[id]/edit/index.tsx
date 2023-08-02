import { RecipeForm } from "../../../../components/recipeEngine/RecipeForm";
import { getSingleRecipe } from "../../../../database/recipes";
import { getUserFromRequest } from "../../../../utils/auth";
import { editRecipeSchema } from "../../../api/recipes/[id]";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";
import { z } from "zod";

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

  return (
    <RecipeForm
      type="edit"
      initialRecipe={initialRecipe}
      onSubmit={async (recipe, coverImage) => {
        // TODO: Show loading indicator while saving
        try {
          await editRecipe(initialRecipe.id, recipe, coverImage);
          router.push("/recipe/" + initialRecipe.id);
        } catch {
          // TODO: Show a notification to the user that the recipe failed to save.
          console.log("Failed to save recipe");
        }
      }}
    />
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
