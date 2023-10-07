import type { getSingleRecipe } from "../../database/recipes";
import type { editRecipeSchema } from "../../handlers/recipes/recipePutHandler";
import type { createRecipeSchema } from "../../handlers/recipes/recipesPostHandler";
import { useLoadingState } from "../../hooks/useLoadingState";
import { Button } from "../button/Button";
import { Dropzone } from "../dropzone/Dropzone";
import styles from "./RecipeForm.module.css";
import { RecipeSettingsEditDialog } from "./RecipeSettingsEditDialog";
import { EditableIngredientList } from "./ingredients/EditableIngredientList";
import type {
  RawIngredientSection,
  RawInstruction,
} from "./ingredients/IngredientForm";
import { EditableInstructionList } from "./instructions/EditableInstructionList";
import { RecipeVisibility } from "@prisma/client";
import { useTranslation } from "next-i18next";
import type { MouseEvent } from "react";
import { useState } from "react";
import type { z } from "zod";

export type RecipeFormProps = {
  initialRecipe?: Awaited<ReturnType<typeof getSingleRecipe>>;
} & (
  | {
      type: "new";
      onSubmit: (
        recipe: z.infer<typeof createRecipeSchema>,
        coverImage: File | null,
      ) => Promise<void>;
    }
  | {
      type: "edit";
      onSubmit: (
        recipe: z.infer<typeof editRecipeSchema>,
        coverImage: File | null,
      ) => Promise<void>;
    }
);

export const RecipeForm = ({
  initialRecipe,
  onSubmit,
  type,
}: RecipeFormProps) => {
  const { t } = useTranslation(["recipeView", "common"]);
  const { isLoading, startLoading, stopLoading } = useLoadingState();

  const [name, setName] = useState(initialRecipe?.name ?? "");
  const [description, setDescription] = useState(
    initialRecipe?.description ?? "",
  );

  // TODO: This can probably be simplified
  const [coverImage, setCoverImage] = useState<
    | File
    | {
        url: string;
      }
    | {
        removed: true;
      }
    | null
  >(
    initialRecipe?.coverImageUrl
      ? {
          url: initialRecipe.coverImageUrl,
        }
      : null,
  );

  const [tags, setTags] = useState<
    {
      id?: string;
      text: string;
    }[]
  >(initialRecipe?.tags ?? []);

  const [ingredientSections, setIngredientSections] = useState<
    (RawIngredientSection & {
      id?: string;
    })[]
  >(
    initialRecipe?.ingredientSections.map((s) => ({
      id: s.id,
      name: s.name,
      ingredients: s.ingredients.map((i) => ({
        id: i.id,
        name: i.name,
        quantity: i.quantity,
        unit: i.unit,
        isOptional: i.isOptional,
      })),
    })) ?? [],
  );

  const [instructions, setInstructions] = useState<
    (RawInstruction & {
      id?: string;
    })[]
  >(
    initialRecipe?.instructions.map((i) => ({
      id: i.id,
      description: i.description,
    })) ?? [],
  );

  const [recipeQuantity, setRecipeQuantity] = useState(
    initialRecipe?.quantity ?? 1,
  );
  const [visibility, setVisibility] = useState(
    initialRecipe?.visibility ?? RecipeVisibility.PRIVATE,
  );

  const [timeEstimateMin, setTimeEstimateMin] = useState(
    initialRecipe?.timeEstimateMinimumMinutes,
  );
  const [timeEstimateMax, setTimeEstimateMax] = useState(
    initialRecipe?.timeEstimateMaximumMinutes ?? undefined,
  );

  const [dialogOpen, setDialogOpen] = useState(false);

  const handleSubmit = async (e: MouseEvent) => {
    e.preventDefault();

    startLoading();
    const baseRecipe = {
      name,
      description,
      ingredientSections: ingredientSections.map((section) => ({
        ...section,
        ingredients: section.ingredients.map((ingredient) => ({
          ...ingredient,
          unit: ingredient.unit ?? undefined,
        })),
      })),
      instructions,
      quantity: recipeQuantity,
      visibility,
      timeEstimateMinimumMinutes: timeEstimateMin,
      timeEstimateMaximumMinutes:
        timeEstimateMax === 0 ? undefined : timeEstimateMax,
      tags: tags,
    };

    const coverImageFile = coverImage instanceof File ? coverImage : null;

    if (type === "edit") {
      const coverImageAction: "remove" | "keep" | "replace" = (() => {
        if (coverImage === null) {
          return "keep";
        } else if ("removed" in coverImage) {
          return "remove";
        } else if ("url" in coverImage) {
          return "keep";
        } else {
          return "replace";
        }
      })();

      await onSubmit(
        {
          ...baseRecipe,
          coverImageAction,
        },
        coverImageFile,
      );
    } else {
      await onSubmit(
        {
          ...baseRecipe,
          tags: tags.map((t) => t.text),
          hasCoverImage: coverImage !== null,
        },
        coverImageFile,
      );
    }

    stopLoading();
  };

  return (
    <div className={styles.container}>
      {type === "new" ? (
        <RecipeSettingsEditDialog
          dialogOpen={dialogOpen}
          setDialogOpen={setDialogOpen}
          recipeQuantity={recipeQuantity}
          setRecipeQuantity={setRecipeQuantity}
          tags={tags}
          setTags={setTags}
          visibility={visibility}
          setVisibility={setVisibility}
          timeEstimateMin={timeEstimateMin}
          setTimeEstimateMin={setTimeEstimateMin}
          timeEstimateMax={timeEstimateMax}
          setTimeEstimateMax={setTimeEstimateMax}
          type="new"
        />
      ) : (
        <RecipeSettingsEditDialog
          dialogOpen={dialogOpen}
          setDialogOpen={setDialogOpen}
          recipeQuantity={recipeQuantity}
          setRecipeQuantity={setRecipeQuantity}
          tags={tags}
          setTags={setTags}
          visibility={visibility}
          setVisibility={setVisibility}
          timeEstimateMin={timeEstimateMin}
          setTimeEstimateMin={setTimeEstimateMin}
          timeEstimateMax={timeEstimateMax}
          setTimeEstimateMax={setTimeEstimateMax}
          type="edit"
          recipeId={initialRecipe?.id || ""}
        />
      )}
      <main className={styles.mainContainer}>
        <h1>
          {type === "new"
            ? t("title")
            : t("edit.title", { name: initialRecipe?.name || "" })}
        </h1>
        <div className={styles.splitContainer}>
          <div className={styles.leftPanel}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
              }}
            >
              <Dropzone
                initialPreviewUrl={initialRecipe?.coverImageUrl}
                onDrop={(f) => {
                  setCoverImage(f);
                }}
                onRemove={() => {
                  setCoverImage({ removed: true });
                }}
              />
              <input
                className={styles.recipeNameInput}
                type="text"
                placeholder={t("edit.recipeName")}
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                }}
                required
              />
              <textarea
                className={styles.descriptionInput}
                placeholder={t("edit.description")}
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                }}
                required
              />
            </div>
            <div className={styles.ingredientsSection}>
              <h2>{t("ingredients.title")}</h2>
              <EditableIngredientList
                ingredientSections={ingredientSections}
                addIngredient={(ingredient, ingredientSectionName) => {
                  const sectionExists = ingredientSections.some(
                    (section) => section.name === ingredientSectionName,
                  );
                  if (!sectionExists) {
                    setIngredientSections([
                      ...ingredientSections,
                      {
                        name: ingredientSectionName,
                        ingredients: [ingredient],
                      },
                    ]);
                  } else {
                    setIngredientSections(
                      ingredientSections.map((section) => {
                        if (section.name === ingredientSectionName) {
                          return {
                            ...section,
                            ingredients: [...section.ingredients, ingredient],
                          };
                        }
                        return section;
                      }),
                    );
                  }
                }}
                removeIngredient={(index, ingredientSectionName) => {
                  const exists = ingredientSections.some(
                    (section) => section.name === ingredientSectionName,
                  );
                  if (!exists) {
                    return;
                  }

                  setIngredientSections(
                    ingredientSections.map((section) => {
                      if (section.name === ingredientSectionName) {
                        return {
                          ...section,
                          ingredients: section.ingredients.filter(
                            (_, i) => i !== index,
                          ),
                        };
                      }
                      return section;
                    }),
                  );
                }}
                addIngredientSection={(name) => {
                  setIngredientSections([
                    ...ingredientSections,
                    {
                      name,
                      ingredients: [],
                    },
                  ]);
                }}
                removeIngredientSection={(index) => {
                  setIngredientSections(
                    ingredientSections.filter((_, i) => i !== index),
                  );
                }}
                setIngredientSectionIngredients={(index, ingredients) => {
                  setIngredientSections(
                    ingredientSections.map((section, i) => {
                      if (i === index) {
                        return {
                          ...section,
                          ingredients,
                        };
                      }
                      return section;
                    }),
                  );
                }}
                setIngredientSections={(sections) => {
                  setIngredientSections(sections);
                }}
              />
            </div>
          </div>
          <div className={styles.rightPanel}>
            <h2>{t("instructions.title")}</h2>
            <EditableInstructionList
              instructions={instructions}
              addInstruction={(instruction) => {
                setInstructions([...instructions, instruction]);
              }}
              removeInstruction={(index) => {
                setInstructions(instructions.filter((_, i) => i !== index));
              }}
              setInstructions={setInstructions}
            />
          </div>
        </div>
        <div className={styles.buttonsContainer}>
          <Button
            onClick={() => {
              setDialogOpen(true);
            }}
            variant="secondary"
            type="button"
          >
            {t("edit.settingsButton")}
          </Button>
          <Button
            style={{ padding: "0.5rem 1rem", minWidth: 150 }}
            type="submit"
            onClick={(e) => void handleSubmit(e)}
            loading={isLoading}
            disabled={!name}
          >
            {type === "edit" ? t("edit.saveRecipe") : t("createRecipe")}
          </Button>
        </div>
      </main>
    </div>
  );
};
