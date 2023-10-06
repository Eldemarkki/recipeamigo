import { Button } from "../../button/Button";
import styles from "./EditIngredientSectionDialog.module.css";
import { useTranslation } from "next-i18next";
import { useId, useState } from "react";

export type EditIngredientSectionDialogProps = {
  initialName: string;
  onSave: (newName: string) => void;
};

export const EditIngredientSectionDialog = ({
  initialName,
  onSave,
}: EditIngredientSectionDialogProps) => {
  const [newName, setNewName] = useState(initialName);
  const { t } = useTranslation(["common", "recipeView"]);

  const inputId = useId();

  return (
    <form
      className={styles.container}
      onSubmit={(e) => {
        e.preventDefault();
        onSave(newName);
      }}
    >
      <div className={styles.inputContainer}>
        <label htmlFor={inputId}>
          {t("recipeView:edit.ingredientSections.sectionName")}
        </label>
        <input
          id={inputId}
          type="text"
          value={newName}
          onChange={(e) => {
            setNewName(e.target.value);
          }}
          required
        />
      </div>
      <Button type="submit">{t("actions.save")}</Button>
    </form>
  );
};
