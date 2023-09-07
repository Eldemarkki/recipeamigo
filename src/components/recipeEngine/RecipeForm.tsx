import type { getSingleRecipe } from "../../database/recipes";
import type { editRecipeSchema } from "../../handlers/recipes/recipePutHandler";
import type { createRecipeSchema } from "../../handlers/recipes/recipesPostHandler";
import { Select } from "../Select";
import { Button } from "../button/Button";
import { Dialog } from "../dialog/Dialog";
import { Dropzone } from "../dropzone/Dropzone";
import { NumberInput } from "../forms/NumberInput";
import { RecipeQuantityPicker } from "../recipeView/RecipeQuantityPicker";
import { TagSelect } from "../tag/TagSelect";
import styles from "./RecipeForm.module.css";
import { EditableIngredientList } from "./ingredients/EditableIngredientList";
import type {
  RawIngredientSection,
  RawInstruction,
} from "./ingredients/IngredientForm";
import { EditableInstructionList } from "./instructions/EditableInstructionList";
import { RecipeVisibility } from "@prisma/client";
import { Trans, useTranslation } from "next-i18next";
import type { MouseEvent } from "react";
import { useId, useState } from "react";
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

  const visibilityId = useId();
  const tagSelectId = useId();

  const handleSubmit = async (e: MouseEvent) => {
    e.preventDefault();
    // TODO: Show loading indicator while saving
    try {
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
    } catch {
      // TODO: Show a notification to the user that the recipe failed to save.
      console.log("Failed to save recipe");
    }
  };

  const visibilityLabelMap: Record<RecipeVisibility, string> = {
    [RecipeVisibility.PRIVATE]: t("recipeVisibility.private"),
    [RecipeVisibility.PUBLIC]: t("recipeVisibility.public"),
    [RecipeVisibility.UNLISTED]: t("recipeVisibility.unlisted"),
  };

  return (
    <div className={styles.container}>
      <Dialog
        open={dialogOpen}
        onClickOutside={() => {
          setDialogOpen(false);
        }}
        overflowVisible // TODO: This is broken if user adds a lot of tags
      >
        <div className={styles.dialogContent}>
          <h1>{t("edit.settings.title")}</h1>
          <div className={styles.settingsContainer}>
            <div className={styles.recipeSettingsContainer}>
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
                      textAlign: "center",
                    }}
                  />
                  <span>min </span>
                  <span>to </span>
                  <NumberInput
                    value={timeEstimateMax}
                    onChange={setTimeEstimateMax}
                    min={0}
                    style={{
                      width: "3rem",
                      textAlign: "center",
                    }}
                  />
                  <span>min</span>
                </Trans>
              </div>
            </div>
            <RecipeQuantityPicker
              quantity={recipeQuantity}
              onChange={setRecipeQuantity}
            />
            <div className={styles.recipeSettingsContainer}>
              <label htmlFor={visibilityId}>{t("edit.visibility")}</label>
              <Select
                id={visibilityId}
                options={[
                  {
                    label: t("recipeVisibility.private"),
                    value: RecipeVisibility.PRIVATE,
                  },
                  {
                    label: t("recipeVisibility.public"),
                    value: RecipeVisibility.PUBLIC,
                  },
                  {
                    label: t("recipeVisibility.unlisted"),
                    value: RecipeVisibility.UNLISTED,
                  },
                ]}
                value={{
                  label: visibilityLabelMap[visibility],
                  value: visibility,
                }}
                onChange={(option) => {
                  if (option) {
                    setVisibility(option.value);
                  }
                }}
              />
            </div>
            <div className={styles.tagsContainer}>
              <label htmlFor={tagSelectId}>
                {t("edit.settings.tagsLabel")}
              </label>
              <TagSelect
                id={tagSelectId}
                tags={tags.map((t) => t.text)}
                setTags={(newTags) => {
                  setTags(newTags.map((t) => ({ text: t })));
                }}
              />
            </div>
          </div>
          <Button
            className={styles.settingsSaveButton}
            onClick={() => {
              setDialogOpen(false);
            }}
          >
            {t("common:actions.save")}
          </Button>
        </div>
      </Dialog>
      {/* TODO: Add h1 tag somewhere*/}
      <main className={styles.mainContainer}>
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
              {/* TODO: Implement adding multiple sections */}
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
            style={{ padding: "0.5rem 1rem" }}
            type="submit"
            onClick={(e) => void handleSubmit(e)}
          >
            {type === "edit" ? t("edit.saveRecipe") : t("createRecipe")}
          </Button>
        </div>
      </main>
    </div>
  );
};
