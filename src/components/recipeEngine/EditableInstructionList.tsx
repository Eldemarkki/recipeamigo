import { useState } from "react";
import { DeleteButton } from "../button/DeleteButton";
import { Button } from "../button/Button";
import styles from "./EditableInstructionList.module.css";
import { useTranslation } from "next-i18next";

export type InstructionListProps = {
  instructions: string[];
  addInstruction: (instruction: string) => void;
  removeInstruction: (index: number) => void;
}

export const EditableInstructionList = ({ instructions, addInstruction, removeInstruction }: InstructionListProps) => {
  const { t } = useTranslation("recipeView");
  const [newInstruction, setNewInstruction] = useState("");

  return <div className={styles.container}>
    <ol className={styles.listContainer}>
      {instructions.map((instruction, index) => (
        <li key={instruction}>
          <div className={styles.instructionListItem}>
            {instruction}
            <DeleteButton onClick={() => removeInstruction(index)} />
          </div>
        </li>
      ))}
    </ol>
    <form className={styles.form} onSubmit={(e) => {
      e.preventDefault();
      addInstruction(newInstruction);
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
