import { IngredientSelect } from "../../IngredientSelect";
import { Button } from "../../button/Button";
import { NumberInput } from "../../forms/NumberInput";
import { UnitSelect } from "../UnitSelect";
import styles from "./IngredientForm.module.css";
import type {
  Ingredient,
  IngredientSection,
  IngredientUnit,
  Instruction,
} from "@prisma/client";
import { useTranslation } from "next-i18next";
import { useId, useState } from "react";

export type RawIngredient = Omit<
  Ingredient,
  "id" | "ingredientSectionId" | "order"
>;

export type RawIngredientSection = Omit<
  IngredientSection,
  "id" | "recipeId" | "order"
> & {
  ingredients: RawIngredient[];
};

export type RawInstruction = Omit<Instruction, "id" | "recipeId" | "order">;

export type IngredientFormProps = {
  type: "new" | "edit";
  addIngredient: (ingredient: RawIngredient) => void;
  onCancel?: () => void;
  initialIngredient?: Partial<RawIngredient>;
};

export const IngredientForm = ({
  type,
  addIngredient,
  initialIngredient,
  onCancel,
}: IngredientFormProps) => {
  const { t } = useTranslation();

  const [ingredientName, setIngredientName] = useState<string | null>(
    initialIngredient?.name ?? null,
  );
  const [ingredientAmount, setIngredientAmount] = useState(
    initialIngredient?.quantity ?? 0,
  );
  const [ingredientUnit, setIngredientUnit] = useState<IngredientUnit | null>(
    initialIngredient?.unit ?? null,
  );
  const [ingredientOptional, setIngredientOptional] = useState(
    initialIngredient?.isOptional ?? false,
  );

  const ingredientAmountId = useId();
  const ingredientUnitId = useId();
  const ingredientOptionalId = useId();

  return (
    <div className={styles.container}>
      {type === "new" && (
        <h4>{t("recipeView:edit.ingredients.newIngredientTitle")}</h4>
      )}
      <form
        className={styles.form}
        onSubmit={(e) => {
          e.preventDefault();
          addIngredient({
            name: ingredientName || "",
            quantity: ingredientAmount,
            unit: ingredientUnit,
            isOptional: ingredientOptional,
          });
          setIngredientName("");
          setIngredientAmount(0);
          setIngredientUnit(null);
        }}
      >
        <div className={styles.inputsContainer}>
          <div className={styles.inputContainer}>
            <IngredientSelect
              ingredient={ingredientName}
              setIngredient={setIngredientName}
            />
          </div>
          <div className={styles.amountRow}>
            <div className={styles.inputContainer} style={{ flex: 1 }}>
              <label className={styles.inputLabel} htmlFor={ingredientAmountId}>
                {t("recipeView:edit.ingredients.amount")}
              </label>
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
              <label className={styles.inputLabel} htmlFor={ingredientUnitId}>
                {t("recipeView:edit.ingredients.unit")}
              </label>
              <UnitSelect value={ingredientUnit} onChange={setIngredientUnit} />
            </div>
          </div>
          <div className={styles.optionalContainer}>
            <input
              id={ingredientOptionalId}
              type="checkbox"
              checked={ingredientOptional}
              onChange={(e) => {
                setIngredientOptional(e.target.checked);
              }}
            />
            <label className={styles.inputLabel} htmlFor={ingredientOptionalId}>
              {t("recipeView:edit.ingredients.isOptional")}
            </label>
          </div>
        </div>
        <div className={styles.buttonsContainer}>
          {onCancel && (
            <Button
              style={{ flex: 1 }}
              type="button"
              onClick={onCancel}
              variant="secondary"
            >
              {t("common:actions.cancel")}
            </Button>
          )}
          <Button style={{ flex: 1 }} type="submit" disabled={!ingredientName}>
            {type === "new"
              ? t("recipeView:edit.ingredients.addIngredientButton")
              : t("common:actions.save")}
          </Button>
        </div>
      </form>
    </div>
  );
};
