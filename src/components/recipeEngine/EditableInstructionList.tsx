import { useState } from "react";
import { Button } from "../button/Button";
import styles from "./EditableInstructionList.module.css";
import { useTranslation } from "next-i18next";
import { RawInstruction } from "./IngredientForm";
import { Reorder } from "framer-motion";
import { EditableInstructionListItem } from "./EditableInstructionListItem";

export type InstructionListProps = {
  instructions: (RawInstruction & {
    id?: string
  })[];
  addInstruction: (instruction: RawInstruction) => void;
  removeInstruction: (index: number) => void;
  setInstructions: (instructions: (RawInstruction & {
    id?: string
  })[]) => void;
}

export const EditableInstructionList = ({ instructions, addInstruction, removeInstruction, setInstructions }: InstructionListProps) => {
  const { t } = useTranslation("recipeView");
  const [newInstruction, setNewInstruction] = useState("");

  return <div className={styles.container}>
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
    <form className={styles.form} onSubmit={(e) => {
      e.preventDefault();
      addInstruction({
        description: newInstruction,
      });
      setNewInstruction("");
    }}>
      <input
        type="text"
        value={newInstruction}
        onChange={(e) => setNewInstruction(e.target.value)}
        placeholder={t("edit.instructions.newInstructionPlaceholder")}
        required
      />
      <Button type="submit">{t("edit.instructions.newInstructionPlaceholder")}</Button>
    </form>
  </div>;
};
