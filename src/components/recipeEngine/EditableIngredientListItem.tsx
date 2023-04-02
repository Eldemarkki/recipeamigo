import { DragHandleDots2Icon, TrashIcon } from "@radix-ui/react-icons";
import { Reorder, useDragControls } from "framer-motion";
import styled from "styled-components";
import { RawIngredient } from "./IngredientForm";

const IngredientListItem = styled(Reorder.Item)({
  display: "flex",
  gap: "0.3rem",
  alignItems: "center",
});

const DeleteButton = styled.button({
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
    backgroundColor: "#ea2727",
    color: "white",
  },
});

const DragHandle = styled(DragHandleDots2Icon)({
  "&:hover, &:focus": {
    cursor: "grab",
  },
});

export type EditableIngredientListItemProps = {
  ingredient: RawIngredient;
  onRemove: () => void;
}


export const EditableIngredientListItem = ({
  ingredient,
  onRemove,
}: EditableIngredientListItemProps) => {
  const controls = useDragControls();

  return <IngredientListItem
    value={ingredient}
    dragListener={false}
    dragControls={controls}
  >
    <DragHandle onPointerDown={(e) => controls.start(e)} />
    <DeleteButton onClick={onRemove}>
      <TrashIcon />
    </DeleteButton>
    <span>
      {ingredient.quantity}{ingredient.unit?.toLowerCase() || ""} {ingredient.name}
    </span>
  </IngredientListItem>;
};
