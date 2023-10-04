import type { RawInstruction } from "../ingredients/IngredientForm";
import styles from "./EditableInstructionList.module.css";
import { EditableInstructionListItem } from "./EditableInstructionListItem";
import { InstructionEditor } from "./InstructionEditor";
import { Reorder } from "framer-motion";
import { useTranslation } from "next-i18next";

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
  const { t } = useTranslation("recipeView");

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
            onRemoveInstruction={() => {
              removeInstruction(index);
            }}
            updateInstruction={(instruction) => {
              setInstructions(
                instructions.map((oldInstruction, oldIndex) =>
                  oldIndex === index
                    ? {
                        ...oldInstruction,
                        description: instruction,
                      }
                    : oldInstruction,
                ),
              );
            }}
          />
        ))}
      </Reorder.Group>
      <InstructionEditor
        onSave={(instruction) => {
          addInstruction({
            description: instruction,
          });
        }}
        buttonText={t("edit.instructions.addInstructionButton")}
      />
    </div>
  );
};
