import { DragHandleDots2Icon, Pencil1Icon } from "@radix-ui/react-icons";
import { Reorder, useDragControls } from "framer-motion";
import styled from "styled-components";
import { IngredientForm, RawIngredient } from "./IngredientForm";
import { DeleteButton } from "../button/DeleteButton";
import { useEffect, useRef, useState } from "react";
import { IngredientText } from "../IngredientText";

const IngredientListItem = styled(Reorder.Item)({
  display: "flex",
  gap: "0.3rem",
  alignItems: "center",
});

const DragHandle = styled(DragHandleDots2Icon)({
  "&:hover, &:focus": {
    cursor: "grab",
  },
});

const Dialog = styled.dialog({
  padding: "3rem 5rem",
  border: "none",
  boxShadow: "0 0 0.5rem 0.5rem rgba(0, 0, 0, 0.1)",
  borderRadius: "0.5rem",
  "::backdrop": {
    pointerEvents: "none",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    backdropFilter: "blur(8px)",
  }
});

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

  return <Dialog ref={dialogRef} open={open}>
    <h1>Editing {ingredient.name}</h1>
    <IngredientForm
      type="edit"
      addIngredient={onEditIngredient}
      initialIngredient={ingredient}
    />
  </Dialog>;
};

const EditButton = styled.button({
  backgroundColor: "transparent",
  display: "flex",
  justifyContent: "center",
  aspectRatio: "1",
  borderRadius: "15%",
  alignItems: "center",
  border: "none",
  margin: 0,
  "&:hover, &:focus": {
    cursor: "pointer",
    backgroundColor: "#f2c61d",
  },
});

export const EditableIngredientListItem = ({
  ingredient,
  onEditIngredient,
  onRemove,
}: EditableIngredientListItemProps) => {
  const ref = useRef<HTMLDialogElement>(null);
  const controls = useDragControls();
  const [isEditing, setIsEditing] = useState(false);

  return <IngredientListItem
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
    <DragHandle onPointerDown={(e) => {
      controls.start(e);
      e.preventDefault();
    }} />
    <DeleteButton onClick={onRemove} />
    <EditButton onClick={() => {
      setIsEditing(true);
      if (ref.current) ref.current.showModal();
    }}>
      <Pencil1Icon />
    </EditButton>
    <span>
      <IngredientText ingredient={ingredient} />
    </span>
  </IngredientListItem>;
};
