import { IngredientText } from "../../IngredientText";
import { DeleteButton } from "../../button/DeleteButton";
import { EditButton } from "../../button/EditButton";
import { Dialog } from "../../dialog/Dialog";
import { DragHandle } from "../../misc/DragHandle";
import styles from "./EditableIngredientListItem.module.css";
import type { RawIngredient } from "./IngredientForm";
import { IngredientForm } from "./IngredientForm";
import { Reorder, useDragControls } from "framer-motion";
import { useTranslation } from "next-i18next";
import { useState } from "react";

export type EditableIngredientListItemProps = {
  ingredient: RawIngredient;
  onEditIngredient: (ingredient: RawIngredient) => void;
  onRemove: () => void;
};

export const EditableIngredientListItem = ({
  ingredient,
  onEditIngredient,
  onRemove,
}: EditableIngredientListItemProps) => {
  const { t } = useTranslation();
  const controls = useDragControls();
  const [isEditing, setIsEditing] = useState(false);

  return (
    <Reorder.Item
      className={styles.ingredientListItem}
      value={ingredient}
      dragListener={false}
      dragControls={controls}
    >
      <Dialog
        open={isEditing}
        onClickOutside={() => {
          setIsEditing(false);
        }}
      >
        <h1>
          {t("recipeView:edit.editingIngredientTitle", {
            ingredientName: ingredient.name,
          })}
        </h1>
        <IngredientForm
          type="edit"
          addIngredient={(newIngredient) => {
            onEditIngredient(newIngredient);
            setIsEditing(false);
          }}
          initialIngredient={ingredient}
        />
      </Dialog>
      <DragHandle
        onPointerDown={(e) => {
          controls.start(e);
          e.preventDefault();
        }}
      />
      <DeleteButton onClick={onRemove} />
      <EditButton
        onClick={() => {
          setIsEditing(true);
        }}
      />
      <span>
        <IngredientText ingredient={ingredient} />
      </span>
    </Reorder.Item>
  );
};
