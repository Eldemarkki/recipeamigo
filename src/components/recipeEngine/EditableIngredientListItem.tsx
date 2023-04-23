import { Pencil1Icon } from "@radix-ui/react-icons";
import { Reorder, useDragControls } from "framer-motion";
import { IngredientForm, RawIngredient } from "./IngredientForm";
import { DeleteButton } from "../button/DeleteButton";
import { useEffect, useRef, useState } from "react";
import { IngredientText } from "../IngredientText";
import { DragHandle } from "../misc/DragHandle";
import styles from "./EditableIngredientListItem.module.css";

export type EditableIngredientListItemProps = {
  ingredient: RawIngredient;
  onEditIngredient: (ingredient: RawIngredient) => void;
  onRemove: () => void;
}

const EditModal = ({
  onClose,
  dialogRef,
  open,
  ingredient,
  onEditIngredient,
}: {
  onClose: () => void;
  dialogRef: React.RefObject<HTMLDialogElement>;
  open: boolean;
  ingredient: RawIngredient;
  onEditIngredient: (ingredient: RawIngredient) => void;
}) => {
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dialogRef && dialogRef.current && event.target instanceof Node && !dialogRef.current.contains(event.target) && open) {
        onClose();
        if (dialogRef.current) dialogRef.current.close();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose, open, dialogRef]);

  return <dialog className={styles.dialog} ref={dialogRef} open={open}>
    <h1>Editing {ingredient.name}</h1>
    <IngredientForm
      type="edit"
      addIngredient={onEditIngredient}
      initialIngredient={ingredient}
    />
  </dialog>;
};

export const EditableIngredientListItem = ({
  ingredient,
  onEditIngredient,
  onRemove,
}: EditableIngredientListItemProps) => {
  const ref = useRef<HTMLDialogElement>(null);
  const controls = useDragControls();
  const [isEditing, setIsEditing] = useState(false);

  return <Reorder.Item
    className={styles.ingredientListItem}
    value={ingredient}
    dragListener={false}
    dragControls={controls}
  >
    <EditModal
      dialogRef={ref}
      open={isEditing}
      onClose={() => {
        ref.current?.close();
        setIsEditing(false);
      }}
      ingredient={ingredient}
      onEditIngredient={newIngredient => {
        onEditIngredient(newIngredient);
        ref.current?.close();
        setIsEditing(false);
      }}
    />
    <DragHandle
      onPointerDown={(e) => {
        controls.start(e);
        e.preventDefault();
      }}
    />
    <DeleteButton onClick={onRemove} />
    <button className={styles.editButton} onClick={() => {
      setIsEditing(true);
      if (ref.current) ref.current.showModal();
    }}>
      <Pencil1Icon />
    </button>
    <span>
      <IngredientText ingredient={ingredient} />
    </span>
  </Reorder.Item>;
};
