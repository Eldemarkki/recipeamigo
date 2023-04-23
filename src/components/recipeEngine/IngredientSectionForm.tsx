import { useState } from "react";
import { Button } from "../button/Button";
import styles from "./IngredientSectionForm.module.css";

export type IngredientSectionFormProps = {
  addIngredientSection: (ingredientSectionName: string) => void;
  onCancel: () => void;
};

export const IngredientSectionForm = (props: IngredientSectionFormProps) => {
  const [sectionName, setSectionName] = useState("");

  return <div className={styles.container}>
    <h3 className={styles.title}>New section</h3>
    <form className={styles.form} onSubmit={(e) => {
      e.preventDefault();
      props.addIngredientSection(sectionName);
    }}>
      <input
        type="text"
        value={sectionName}
        onChange={(e) => setSectionName(e.target.value)}
        placeholder="Section name"
        required
      />
      <div className={styles.buttonsContainer}>
        <Button style={{ flex: 1 }} type="button" onClick={props.onCancel} variant="secondary">
          Cancel
        </Button>
        <Button style={{ flex: 1 }} type="submit">
          Create
        </Button>
      </div>
    </form>
  </div>;
};
