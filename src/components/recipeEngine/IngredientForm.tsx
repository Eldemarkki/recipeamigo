import { Ingredient, IngredientSection, IngredientUnit } from "@prisma/client";
import { useId, useState } from "react";
import { capitalizeFirstLetter } from "../../utils/stringUtils";
import { NumberInput } from "../forms/NumberInput";
import { Button } from "../button/Button";
import styles from "./IngredientForm.module.css";
import { useTranslation } from "next-i18next";

export type RawIngredient = Omit<Ingredient, "id" | "ingredientSectionId" | "order">;

export type RawIngredientSection = Omit<IngredientSection, "id" | "recipeId" | "order"> & {
  ingredients: RawIngredient[];
}

export type IngredientFormProps = {
  type: "new" | "edit",
  addIngredient: (ingredient: RawIngredient) => void;
  onCancel?: () => void;
  initialIngredient?: Partial<RawIngredient>;
}

const units = Object.keys(IngredientUnit) as IngredientUnit[];

export const IngredientForm = ({
  type,
  addIngredient,
  initialIngredient,
  onCancel
}: IngredientFormProps) => {
  const { t } = useTranslation();

  const [ingredientName, setIngredientName] = useState(initialIngredient?.name ?? "");
  const [ingredientAmount, setIngredientAmount] = useState(initialIngredient?.quantity ?? 0);
  const [ingredientUnit, setIngredientUnit] = useState<IngredientUnit | null>(initialIngredient?.unit ?? null);
  const [ingredientOptional, setIngredientOptional] = useState(initialIngredient?.isOptional ?? false);

  const ingredientNameId = useId();
  const ingredientAmountId = useId();
  const ingredientUnitId = useId();
  const ingredientOptionalId = useId();

  return <div className={styles.container}>
    {type === "new" && <h4 className={styles.title}>{t("recipeView:edit.ingredients.newIngredientTitle")}</h4>}
    <form className={styles.form} onSubmit={(e) => {
      e.preventDefault();
      addIngredient({
        name: ingredientName,
        quantity: ingredientAmount,
        unit: ingredientUnit,
        isOptional: ingredientOptional,
      });
      setIngredientName("");
      setIngredientAmount(0);
      setIngredientUnit(null);
    }}>
      <div className={styles.inputsContainer}>
        <div className={styles.inputContainer}>
          <label className={styles.inputLabel} htmlFor={ingredientNameId}>{t("recipeView:edit.ingredients.ingredientName")}</label>
          <input
            id={ingredientNameId}
            value={ingredientName}
            onChange={(event) => setIngredientName(event.target.value)}
            type="text"
            required
          />
        </div>
        <div className={styles.amountRow}>
          <div className={styles.inputContainer} style={{ flex: 1 }}>
            <label className={styles.inputLabel} htmlFor={ingredientAmountId}>{t("recipeView:edit.ingredients.amount")}</label>
            <div className={styles.ingredientAmountInputContainer}>
              <NumberInput
                id={ingredientAmountId}
                min={0}
                required
                value={ingredientAmount}
                onChange={setIngredientAmount}
                key={ingredientAmount}
                style={{ flex: 1 }}
              />
            </div>
          </div>
          <div className={styles.inputContainer}>
            <label className={styles.inputLabel} htmlFor={ingredientUnitId}>{t("recipeView:edit.ingredients.unit")}</label>
            <select
              id={ingredientUnitId}
              value={ingredientUnit || ""}
              onChange={(e) => {
                const value = e.target.value as IngredientUnit | "";
                setIngredientUnit(value || null);
              }}
              aria-label="Unit"
            >
              <option value="">{t("recipeView:edit.ingredients.noUnit")}</option>
              {units.map((unit) => <option key={unit} value={unit}>{capitalizeFirstLetter(unit)}</option>)}
            </select>
          </div>
        </div>
        <div className={styles.optionalContainer}>
          <input
            className={styles.optionalCheckbox}
            id={ingredientOptionalId}
            type="checkbox"
            checked={ingredientOptional}
            onChange={(e) => setIngredientOptional(e.target.checked)}
          />
          <label className={styles.inputLabel} htmlFor={ingredientOptionalId}>{t("recipeView:edit.ingredients.isOptional")}</label>
        </div>
      </div>
      <div className={styles.buttonsContainer}>
        {onCancel && <Button style={{ flex: 1 }} type="button" onClick={onCancel} variant="secondary">
          {t("common:actions.cancel")}
        </Button>}
        <Button style={{ flex: 1 }} type="submit">
          {type === "new" ? t("recipeView:edit.ingredients.addIngredientButton") : t("common:actions.save")}
        </Button>
      </div>
    </form>
  </div>;
};
