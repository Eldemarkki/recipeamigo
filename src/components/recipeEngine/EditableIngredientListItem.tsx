import { DragHandleDots2Icon } from "@radix-ui/react-icons";
import { Reorder, useDragControls } from "framer-motion";
import styled from "styled-components";
import { RawIngredient } from "./IngredientForm";
import { DeleteButton } from "../button/DeleteButton";

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
    <DeleteButton onClick={onRemove} />
    <span>
      {ingredient.quantity}{ingredient.unit?.toLowerCase() || ""} {ingredient.name}
    </span>
  </IngredientListItem>;
};
