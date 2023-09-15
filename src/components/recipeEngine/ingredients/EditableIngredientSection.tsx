import { CircularButton } from "../../button/Button";
import { DeleteButton } from "../../button/DeleteButton";
import { ConfirmationDialog } from "../../dialog/ConfirmationDialog";
import { DragHandle } from "../../misc/DragHandle";
import { EditableIngredientListItem } from "./EditableIngredientListItem";
import styles from "./EditableIngredientSection.module.css";
import type { RawIngredient, RawIngredientSection } from "./IngredientForm";
import { IngredientForm } from "./IngredientForm";
import { PlusIcon } from "@radix-ui/react-icons";
import { Reorder, useDragControls } from "framer-motion";
import { useTranslation } from "next-i18next";
import { useState } from "react";

export type EditableIngredientSectionProps = {
  ingredientSection: RawIngredientSection;
  onRemove: () => void;
  setIngredients: (ingredients: RawIngredient[]) => void;
  onRemoveIngredient: (ingredientIndex: number) => void;
  newItemType:
    | { type: "ingredient"; ingredientSectionName: string }
    | { type: "section" }
    | null;
  setNewItemType: (
    newItemType: EditableIngredientSectionProps["newItemType"],
  ) => void;
  addIngredient: (ingredient: RawIngredient) => void;
  onEditIngredient: (ingredient: RawIngredient, index: number) => void;
};

export const EditableIngredientSection = ({
  ingredientSection,
  onRemove,
  setIngredients,
  onRemoveIngredient,
  newItemType,
  setNewItemType,
  addIngredient,
  onEditIngredient,
}: EditableIngredientSectionProps) => {
  const controls = useDragControls();
  const [deletionConfirmationOpen, setDeletionConfirmationOpen] =
    useState(false);

  const { t } = useTranslation(["common", "recipeView"]);

  return (
    <Reorder.Item
      className={styles.container}
      value={ingredientSection}
      dragListener={false}
      dragControls={controls}
    >
      <ConfirmationDialog
        isOpen={deletionConfirmationOpen}
        title={t("recipeView:edit.ingredientSections.deletion.title")}
        message={t("recipeView:edit.ingredientSections.deletion.text")}
        onCancel={() => {
          setDeletionConfirmationOpen(false);
        }}
        onConfirm={() => {
          setDeletionConfirmationOpen(false);
          onRemove();
        }}
        cancelButtonText={t("common:actions.cancel")}
        cancelButtonVariant="secondary"
        confirmButtonText={t("common:actions.delete")}
        confirmButtonVariant="danger"
      />
      <div className={styles.topRow}>
        <DragHandle
          onPointerDown={(e) => {
            controls.start(e);
            e.preventDefault();
          }}
        />
        <h3 className={styles.title}>{ingredientSection.name}</h3>
        <DeleteButton
          onClick={() => {
            setDeletionConfirmationOpen(true);
          }}
        />
      </div>
      <Reorder.Group
        className={styles.ingredientList}
        axis="y"
        values={ingredientSection.ingredients}
        onReorder={(items) => {
          setIngredients(items as RawIngredient[]);
        }}
      >
        {ingredientSection.ingredients.map((ingredient, index) => (
          <EditableIngredientListItem
            key={ingredient.name}
            ingredient={ingredient}
            onEditIngredient={(i) => {
              onEditIngredient(i, index);
            }}
            onRemove={() => {
              onRemoveIngredient(index);
            }}
          />
        ))}
      </Reorder.Group>
      {newItemType &&
      newItemType.type === "ingredient" &&
      newItemType.ingredientSectionName === ingredientSection.name ? (
        <IngredientForm
          type="new"
          addIngredient={addIngredient}
          onCancel={() => {
            setNewItemType(null);
          }}
        />
      ) : (
        <div className={styles.ingredientSectionBottomSection}>
          <CircularButton
            onClick={() => {
              setNewItemType({
                type: "ingredient",
                ingredientSectionName: ingredientSection.name,
              });
            }}
          >
            <PlusIcon />
          </CircularButton>
        </div>
      )}
    </Reorder.Item>
  );
};
