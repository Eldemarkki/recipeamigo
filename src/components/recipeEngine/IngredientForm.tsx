import { Ingredient, IngredientSection, IngredientUnit } from "@prisma/client";
import { useId, useState } from "react";
import { capitalizeFirstLetter } from "../../utils/stringUtils";
import { NumberInput } from "../forms/NumberInput";
import { Button } from "../button/Button";
import styles from "./IngredientForm.module.css";

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
  const [ingredientName, setIngredientName] = useState(initialIngredient?.name ?? "");
  const [ingredientAmount, setIngredientAmount] = useState(initialIngredient?.quantity ?? 0);
  const [ingredientUnit, setIngredientUnit] = useState<IngredientUnit | null>(initialIngredient?.unit ?? null);
  const [ingredientOptional, setIngredientOptional] = useState(initialIngredient?.isOptional ?? false);

  const ingredientNameId = useId();
  const ingredientAmountId = useId();
  const ingredientUnitId = useId();
  const ingredientOptionalId = useId();

  return <div className={styles.container}>
    {type === "new" && <h4 className={styles.title}>New ingredient</h4>}
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
          <label className={styles.inputLabel} htmlFor={ingredientNameId}>Ingredient name</label>
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
            <label className={styles.inputLabel} htmlFor={ingredientAmountId}>Amount</label>
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
            <label className={styles.inputLabel} htmlFor={ingredientUnitId}>Unit</label>
            <select
              id={ingredientUnitId}
              value={ingredientUnit || ""}
              onChange={(e) => {
                const value = e.target.value as IngredientUnit | "";
                setIngredientUnit(value || null);
              }}
              aria-label="Unit"
            >
              <option value="">No unit</option>
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
          <label className={styles.inputLabel} htmlFor={ingredientOptionalId}>Optional</label>
        </div>
      </div>
      <div className={styles.buttonsContainer}>
        {onCancel && <Button style={{ flex: 1 }} type="button" onClick={onCancel} variant="secondary">
          Cancel
        </Button>}
        <Button style={{ flex: 1 }} type="submit">
          {type === "new" ? "Add ingredient" : "Save"}
        </Button>
      </div>
    </form>
  </div>;
};
