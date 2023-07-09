import { useState } from "react";
import { EditableIngredientList } from "../../../components/recipeEngine/ingredients/EditableIngredientList";
import { RawIngredientSection, RawInstruction } from "../../../components/recipeEngine/ingredients/IngredientForm";
import { EditableInstructionList } from "../../../components/recipeEngine/instructions/EditableInstructionList";
import { z } from "zod";
import { createRecipeSchema } from "../../api/recipes";
import { useRouter } from "next/router";
import { RecipeQuantityPicker } from "../../../components/recipeView/RecipeQuantityPicker";
import { createRecipe } from "../../../database/recipes";
import { GetServerSideProps } from "next";
import { getUserFromRequest } from "../../../utils/auth";
import { Button } from "../../../components/button/Button";
import { NumberInput } from "../../../components/forms/NumberInput";
import styles from "./index.module.css";
import { Dropzone } from "../../../components/dropzone/Dropzone";
import { Trans, useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { TagSelect } from "../../../components/tag/TagSelect";

const saveRecipe = async (recipe: z.infer<typeof createRecipeSchema>, coverImage: File | null) => {
  const response = await fetch("/api/recipes", {
    method: "POST",
    body: JSON.stringify(recipe),
    headers: {
      "Content-Type": "application/json"
    }
  });

  const data = await response.json() as { recipe: Awaited<ReturnType<typeof createRecipe>>, coverImageUploadUrl: string };

  if (data.coverImageUploadUrl) {
    await fetch(data.coverImageUploadUrl, {
      method: "PUT",
      body: coverImage
    });
  }

  return data.recipe;
};

export default function NewRecipePage() {
  const { t } = useTranslation();
  const router = useRouter();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [previewImage, setCoverImage] = useState<File | null>(null);
  const [tags, setTags] = useState<string[]>([]);

  const [ingredientSections, setIngredientSections] = useState<RawIngredientSection[]>([]);

  const [instructions, setInstructions] = useState<RawInstruction[]>([]);

  const [recipeQuantity, setRecipeQuantity] = useState(1);
  const [isPublic, setIsPublic] = useState(false);

  const [timeEstimateMin, setTimeEstimateMin] = useState(0);
  const [timeEstimateMax, setTimeEstimateMax] = useState(0);

  return <div className={styles.container}>
    <form onSubmit={async (e) => {
      e.preventDefault();
      // TODO: Show loading indicator while saving
      const recipe = await saveRecipe({
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
        tags,
        hasCoverImage: previewImage !== null
      }, previewImage);
      if (recipe) {
        router.push("/recipe/" + recipe.id);
      }
      else {
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
            placeholder={t("recipeView:edit.recipeName")}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder={t("recipeView:edit.description")}
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
              <label htmlFor="is-public">{t("recipeView:edit.isPublic")}</label>
              <input
                id="is-public"
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
              />
            </div>
          </div>
          <div className={styles.timeEstimateContainer}>
            <span>{t("recipeView:edit.timeEstimateTitle")}</span>
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
          <Dropzone onDrop={f => setCoverImage(f)} />
          <TagSelect
            tags={tags}
            setTags={setTags}
          />
        </div>
        <Button style={{ padding: "0.5rem 1rem" }} type="submit">{t("recipeView:createRecipe")}</Button>
      </div>
    </form>
    {/* TODO: Add h1 tag somewhere*/}
    <main className={styles.splitContainer}>
      <div className={styles.leftPanel}>
        <h2>{t("recipeView:ingredientsTitle")}</h2>
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
        <h2>{t("recipeView:instructionsTitle")}</h2>
        <EditableInstructionList
          instructions={instructions}
          addInstruction={(instruction) => setInstructions([...instructions, instruction])}
          removeInstruction={(index) => setInstructions(instructions.filter((_, i) => i !== index))}
          setInstructions={setInstructions}
        />
      </div>
    </main>
  </div>;
}

export const getServerSideProps: GetServerSideProps<{}> = async ({ req, locale }) => {
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
      ...(await serverSideTranslations(locale ?? "en"))
    },
  };
};
