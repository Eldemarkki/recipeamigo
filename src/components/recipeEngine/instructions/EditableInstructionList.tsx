import styles from "./EditableInstructionList.module.css";
import { RawInstruction } from "../ingredients/IngredientForm";
import { Reorder } from "framer-motion";
import { EditableInstructionListItem } from "./EditableInstructionListItem";
import { InstructionEditor } from "./InstructionEditor";

export type InstructionListProps = {
  instructions: (RawInstruction & {
    id?: string;
  })[];
  addInstruction: (instruction: RawInstruction) => void;
  removeInstruction: (index: number) => void;
  setInstructions: (
    instructions: (RawInstruction & {
      id?: string;
    })[],
  ) => void;
};

export const EditableInstructionList = ({
  instructions,
  addInstruction,
  removeInstruction,
  setInstructions,
}: InstructionListProps) => {
  return (
    <div className={styles.container}>
      <Reorder.Group
        onReorder={setInstructions}
        values={instructions}
        axis="y"
        className={styles.listContainer}
      >
        {instructions.map((instruction, index) => (
          <EditableInstructionListItem
            key={instruction.id + "-" + instruction.description}
            instruction={instruction}
            onRemoveInstruction={() => removeInstruction(index)}
          />
        ))}
      </Reorder.Group>
      <InstructionEditor
        addInstruction={(instruction) => {
          addInstruction({
            description: instruction,
          });
        }}
      />
    </div>
  );
};
