import { DeleteButton } from "../../button/DeleteButton";
import { DragHandle } from "../../misc/DragHandle";
import { InstructionRenderer } from "../InstructionRenderer";
import { RawInstruction } from "../ingredients/IngredientForm";
import styles from "./EditableInstructionListItem.module.css";
import { Reorder, useDragControls } from "framer-motion";

export type InstructionListProps = {
  instruction: RawInstruction & {
    id?: string;
  };
  onRemoveInstruction: () => void;
};

export const EditableInstructionListItem = ({
  instruction,
  onRemoveInstruction,
}: InstructionListProps) => {
  const controls = useDragControls();

  return (
    <Reorder.Item
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
      <InstructionRenderer instruction={instruction.description} />
    </Reorder.Item>
  );
};
