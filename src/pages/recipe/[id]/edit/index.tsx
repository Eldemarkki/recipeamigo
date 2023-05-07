import { useState } from "react";
import { EditableIngredientList } from "../../../../components/recipeEngine/EditableIngredientList";
import { EditableInstructionList } from "../../../../components/recipeEngine/EditableInstructionList";
import { z } from "zod";
import { useRouter } from "next/router";
import { RecipeQuantityPicker } from "../../../../components/recipeView/RecipeQuantityPicker";
import { GetServerSideProps } from "next";
import { getUserFromRequest } from "../../../../utils/auth";
import { Button } from "../../../../components/button/Button";
import { NumberInput } from "../../../../components/forms/NumberInput";
import styles from "./index.module.css";
import { getSingleRecipe } from "../../../../database/recipes";
import { Ingredient, IngredientSection, Instruction, Recipe } from "@prisma/client";
import { editRecipeSchema } from "../../../api/recipes/[id]";
import { RawIngredientSection, RawInstruction } from "../../../../components/recipeEngine/IngredientForm";
import { ConvertDates } from "../../../../utils/types";
import { Dropzone } from "../../../../components/dropzone/Dropzone";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { Trans, useTranslation } from "next-i18next";

const editRecipe = async (recipeId: string, recipe: z.infer<typeof editRecipeSchema>, coverImage: File | null) => {
  const formData = new FormData();
  formData.append("recipe", JSON.stringify(recipe));
  if (coverImage) {
    formData.append("coverImage", coverImage);
  }

  await fetch(`/api/recipes/${recipeId}`, {
    method: "PUT",
    body: formData
  });
};

export type EditRecipePageProps = {
  recipe: ConvertDates<Recipe> & {
    ingredientSections: (IngredientSection & {
      ingredients: Ingredient[];
    })[];
    instructions: Instruction[];
  }
}

export default function EditRecipePage({ recipe: initialRecipe }: EditRecipePageProps) {
  const { t } = useTranslation("recipeView");
  const router = useRouter();

  const [name, setName] = useState(initialRecipe.name);
  const [description, setDescription] = useState(initialRecipe.description);
  const [coverImage, setCoverImage] = useState<File | null>(null);

  const [ingredientSections, setIngredientSections] = useState<((RawIngredientSection & {
    id?: string;
  }))[]>(
    initialRecipe.ingredientSections.map(s => ({
      id: s.id,
      name: s.name,
      ingredients: s.ingredients.map(i => ({
        id: i.id,
        name: i.name,
        quantity: i.quantity,
        unit: i.unit,
        isOptional: i.isOptional
      })),
    }))
  );

  const [instructions, setInstructions] = useState<(RawInstruction & {
    id?: string;
  })[]>(initialRecipe.instructions.map(i => ({
    id: i.id,
    description: i.description,
  })));

  const [recipeQuantity, setRecipeQuantity] = useState(initialRecipe.quantity);
  const [isPublic, setIsPublic] = useState(initialRecipe.isPublic);

  const [timeEstimateMin, setTimeEstimateMin] = useState(initialRecipe.timeEstimateMinimumMinutes);
  const [timeEstimateMax, setTimeEstimateMax] = useState(initialRecipe.timeEstimateMaximumMinutes ?? undefined);

  return <div className={styles.container}>
    <form onSubmit={async (e) => {
      e.preventDefault();
      // TODO: Show loading indicator while saving
      try {
        const shouldDeleteCoverImage = coverImage === null && initialRecipe.coverImageUrl !== null;

        await editRecipe(initialRecipe.id, {
          name,
          description,
          ingredientSections: ingredientSections.map((section) => ({
            ...section,
            ingredients: section.ingredients.map((ingredient) => ({
              ...ingredient,
              unit: ingredient.unit ?? undefined
            }))
          })),
          instructions,
          quantity: recipeQuantity,
          isPublic,
          timeEstimateMinimumMinutes: timeEstimateMin,
          timeEstimateMaximumMinutes: timeEstimateMax === 0 ? undefined : timeEstimateMax,
          shouldDeleteCoverImage
        }, coverImage);

        router.push("/recipe/" + initialRecipe.id);
      }
      catch {
        // TODO: Show a notification to the user that the recipe failed to save.
        console.log("Failed to save recipe");
      }
    }}>
      <div className={styles.topRow}>
        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}>
          <input
            className={styles.recipeNameInput}
            type="text"
            placeholder={t("edit.recipeName")}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder={t("edit.description")}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
          <div className={styles.recipeSettingsContainer}>
            <RecipeQuantityPicker
              quantity={recipeQuantity}
              onChange={setRecipeQuantity}
            />
            <div>
              <label htmlFor="is-public">{t("edit.isPublic")}</label>
              <input
                id="is-public"
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
              />
            </div>
          </div>
          <div className={styles.timeEstimateContainer}>
            <span>{t("edit.timeEstimateTitle")}</span>
            {/* TODO: Allow empty value (now it's just 0 if user tries to clear all) */}
            <div>
              <Trans i18nKey="recipeView:edit.timeEstimate">
                <NumberInput
                  value={timeEstimateMin}
                  onChange={setTimeEstimateMin}
                  min={0}
                  style={{
                    width: "3rem",
                    textAlign: "center"
                  }}
                />
                <span>min{" "}</span>
                <span>to{" "}</span>
                <NumberInput
                  value={timeEstimateMax}
                  onChange={setTimeEstimateMax}
                  min={0}
                  style={{
                    width: "3rem",
                    textAlign: "center"
                  }}
                />
                <span>min</span>
              </Trans>
            </div>
          </div>
          <Dropzone
            initialPreviewUrl={initialRecipe.coverImageUrl}
            onDrop={f => setCoverImage(f)}
          />
        </div>
        <Button style={{ padding: "0.5rem 1rem" }} type="submit">{t("edit.saveRecipe")}</Button>
      </div>
    </form>
    {/* TODO: Add h1 tag somewhere*/}
    <main className={styles.splitContainer}>
      <div className={styles.leftPanel}>
        <h2>{t("ingredientsTitle")}</h2>
        {/* TODO: Implement adding multiple sections */}
        <EditableIngredientList
          ingredientSections={ingredientSections}
          addIngredient={(ingredient, ingredientSectionName) => {
            const sectionExists = ingredientSections.some(section => section.name === ingredientSectionName);
            if (!sectionExists) {
              setIngredientSections([...ingredientSections, {
                name: ingredientSectionName,
                ingredients: [ingredient]
              }]);
            }
            else {
              setIngredientSections(ingredientSections.map(section => {
                if (section.name === ingredientSectionName) {
                  return {
                    ...section,
                    ingredients: [...section.ingredients, ingredient]
                  };
                }
                return section;
              }));
            }
          }}
          removeIngredient={(index, ingredientSectionName) => {
            const exists = ingredientSections.some(section => section.name === ingredientSectionName);
            if (!exists) {
              return;
            }

            setIngredientSections(ingredientSections.map(section => {
              if (section.name === ingredientSectionName) {
                return {
                  ...section,
                  ingredients: section.ingredients.filter((_, i) => i !== index)
                };
              }
              return section;
            }));
          }}
          addIngredientSection={(name) => setIngredientSections([...ingredientSections, {
            name,
            ingredients: []
          }])}
          removeIngredientSection={(index) => setIngredientSections(ingredientSections.filter((_, i) => i !== index))}
          setIngredientSectionIngredients={(index, ingredients) => {
            setIngredientSections(ingredientSections.map((section, i) => {
              if (i === index) {
                return {
                  ...section,
                  ingredients
                };
              }
              return section;
            }));
          }}
          setIngredientSections={(sections) => setIngredientSections(sections)}
        />
      </div>
      <div className={styles.rightPanel}>
        <h2>{t("instructionsTitle")}</h2>
        <EditableInstructionList
          instructions={instructions}
          addInstruction={(instruction) => setInstructions([...instructions, instruction])}
          removeInstruction={(index) => setInstructions(instructions.filter((_, i) => i !== index))}
          setInstructions={setInstructions}
        />
      </div>
    </main>
  </div >;
}

export const getServerSideProps: GetServerSideProps<EditRecipePageProps> = async ({ req, params, locale }) => {
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
      recipe: {
        ...recipe,
        createdAt: recipe.createdAt.getDate(),
        updatedAt: recipe.updatedAt.getDate(),
      }
    },
  };
};
