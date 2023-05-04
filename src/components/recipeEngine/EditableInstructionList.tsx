import { useState } from "react";
import { DeleteButton } from "../button/DeleteButton";
import { Button } from "../button/Button";
import styles from "./EditableInstructionList.module.css";
import { useTranslation } from "next-i18next";
import { RawInstruction } from "./IngredientForm";

export type InstructionListProps = {
  instructions: (RawInstruction & {
    id?: string
  })[];
  addInstruction: (instruction: RawInstruction) => void;
  removeInstruction: (index: number) => void;
}

export const EditableInstructionList = ({ instructions, addInstruction, removeInstruction }: InstructionListProps) => {
  const { t } = useTranslation("recipeView");
  const [newInstruction, setNewInstruction] = useState("");

  return <div className={styles.container}>
    <ol className={styles.listContainer}>
      {instructions.map((instruction, index) => (
        <li key={instruction.description}>
          <div className={styles.instructionListItem}>
            {instruction.description}
            <DeleteButton onClick={() => removeInstruction(index)} />
          </div>
        </li>
      ))}
    </ol>
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
