import { Reorder, useDragControls } from "framer-motion";
import { RawInstruction } from "../ingredients/IngredientForm";
import styles from "./EditableInstructionListItem.module.css";
import { DeleteButton } from "../../button/DeleteButton";
import { DragHandle } from "../../misc/DragHandle";

export type InstructionListProps = {
  instruction: RawInstruction & {
    id?: string
  };
  onRemoveInstruction: () => void;
};

export const EditableInstructionListItem = ({ instruction, onRemoveInstruction }: InstructionListProps) => {
  const controls = useDragControls();

  return <Reorder.Item
    value={instruction}
    key={instruction.description}
    dragListener={false}
    dragControls={controls}
    className={styles.instructionListItem}
  >
    <DragHandle
      onPointerDown={(e) => {
        controls.start(e);
        e.preventDefault();
      }}
    />
    <DeleteButton onClick={onRemoveInstruction} />
    <span>
      {instruction.description}
    </span>
  </Reorder.Item>;
};
