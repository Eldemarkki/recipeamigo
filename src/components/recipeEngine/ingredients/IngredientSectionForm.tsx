import { Button } from "../../button/Button";
import styles from "./IngredientSectionForm.module.css";
import { useTranslation } from "next-i18next";
import { useState } from "react";

export type IngredientSectionFormProps = {
  addIngredientSection: (ingredientSectionName: string) => void;
  onCancel: () => void;
};

export const IngredientSectionForm = (props: IngredientSectionFormProps) => {
  const { t } = useTranslation();
  const [sectionName, setSectionName] = useState("");

  return (
    <div className={styles.container}>
      <h3>{t("recipeView:edit.ingredientSections.newSectionTitle")}</h3>
      <form
        className={styles.form}
        onSubmit={(e) => {
          e.preventDefault();
          props.addIngredientSection(sectionName);
        }}
      >
        <input
          type="text"
          value={sectionName}
          onChange={(e) => {
            setSectionName(e.target.value);
          }}
          placeholder={t("recipeView:edit.ingredientSections.sectionName")}
          required
        />
        <div className={styles.buttonsContainer}>
          <Button
            style={{ flex: 1 }}
            type="button"
            onClick={props.onCancel}
            variant="secondary"
          >
            {t("common:actions.cancel")}
          </Button>
          <Button style={{ flex: 1 }} type="submit">
            {t("common:actions.create")}
          </Button>
        </div>
      </form>
    </div>
  );
};
