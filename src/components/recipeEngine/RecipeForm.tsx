import { Trans, useTranslation } from "next-i18next";
import { getSingleRecipe } from "../../database/recipes";
import { MouseEvent, useId, useState } from "react";
import {
  RawIngredientSection,
  RawInstruction,
} from "./ingredients/IngredientForm";
import styles from "./RecipeForm.module.css";
import { RecipeQuantityPicker } from "../recipeView/RecipeQuantityPicker";
import { NumberInput } from "../forms/NumberInput";
import { Dropzone } from "../dropzone/Dropzone";
import { TagSelect } from "../tag/TagSelect";
import { Button } from "../button/Button";
import { EditableIngredientList } from "./ingredients/EditableIngredientList";
import { EditableInstructionList } from "./instructions/EditableInstructionList";
import { editRecipeSchema } from "../../pages/api/recipes/[id]";
import { z } from "zod";
import { createRecipeSchema } from "../../pages/api/recipes";
import { Dialog } from "../dialog/Dialog";

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
          url: initialRecipe?.coverImageUrl,
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
  const [isPublic, setIsPublic] = useState(initialRecipe?.isPublic ?? false);

  const [timeEstimateMin, setTimeEstimateMin] = useState(
    initialRecipe?.timeEstimateMinimumMinutes,
  );
  const [timeEstimateMax, setTimeEstimateMax] = useState(
    initialRecipe?.timeEstimateMaximumMinutes ?? undefined,
  );

  const [dialogOpen, setDialogOpen] = useState(false);

  const isPublicId = useId();
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
        isPublic,
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
      } else if (type === "new") {
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

  return (
    <div className={styles.container}>
      <Dialog open={dialogOpen} onClickOutside={() => setDialogOpen(false)}>
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
              <label htmlFor={isPublicId}>{t("edit.isPublic")}</label>
              <input
                id={isPublicId}
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
              />
            </div>
            <div className={styles.tagsContainer}>
              <label htmlFor={tagSelectId}>
                {t("edit.settings.tagsLabel")}
              </label>
              <TagSelect
                id={tagSelectId}
                tags={tags.map((t) => t.text)}
                setTags={(newTags) =>
                  setTags(newTags.map((t) => ({ text: t })))
                }
              />
            </div>
          </div>
          <Button
            className={styles.settingsSaveButton}
            onClick={() => setDialogOpen(false)}
          >
            {t("common:actions.save")}
          </Button>
        </div>
      </Dialog>
      {/* TODO: Add h1 tag somewhere*/}
      <main className={styles.splitContainer}>
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
              onChange={(e) => setName(e.target.value)}
              required
            />
            <textarea
              className={styles.descriptionInput}
              placeholder={t("edit.description")}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          <div className={styles.ingredientsSection}>
            <h2 className={styles.subtitle}>{t("ingredientsTitle")}</h2>
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
              addIngredientSection={(name) =>
                setIngredientSections([
                  ...ingredientSections,
                  {
                    name,
                    ingredients: [],
                  },
                ])
              }
              removeIngredientSection={(index) =>
                setIngredientSections(
                  ingredientSections.filter((_, i) => i !== index),
                )
              }
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
              setIngredientSections={(sections) =>
                setIngredientSections(sections)
              }
            />
          </div>
        </div>
        <div className={styles.rightPanel}>
          <div className={styles.buttonsContainer}>
            <Button
              onClick={() => setDialogOpen(true)}
              variant="secondary"
              type="button"
            >
              {t("edit.settingsButton")}
            </Button>
            <Button
              style={{ padding: "0.5rem 1rem" }}
              type="submit"
              onClick={(e) => handleSubmit(e)}
            >
              {type === "edit" ? t("edit.saveRecipe") : t("createRecipe")}
            </Button>
          </div>
          <h2>{t("instructionsTitle")}</h2>
          <EditableInstructionList
            instructions={instructions}
            addInstruction={(instruction) =>
              setInstructions([...instructions, instruction])
            }
            removeInstruction={(index) =>
              setInstructions(instructions.filter((_, i) => i !== index))
            }
            setInstructions={setInstructions}
          />
        </div>
      </main>
    </div>
  );
};
