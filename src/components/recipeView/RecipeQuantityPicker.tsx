import { CircularButton } from "../button/Button";
import { NumberInput } from "../forms/NumberInput";
import styles from "./RecipeQuantityPicker.module.css";
import { MinusIcon, PlusIcon } from "@radix-ui/react-icons";
import { useTranslation } from "next-i18next";
import { useId } from "react";

export type RecipeQuantityPickerProps = {
  quantity: number;
  onChange: (quantity: number) => void;
};

export const RecipeQuantityPicker = ({
  quantity,
  onChange,
}: RecipeQuantityPickerProps) => {
  const { t } = useTranslation();
  const inputId = useId();

  return (
    <div className={styles.container}>
      <label htmlFor={inputId}>{t("recipeView:recipeQuantity.title")}</label>
      <div className={styles.inputContainer}>
        <CircularButton
          className={styles.changeButton}
          type="button"
          onClick={() => {
            onChange(Math.max(quantity - 1, 1));
          }}
          aria-label={t("recipeView:recipeQuantity.decrease")}
        >
          <MinusIcon />
        </CircularButton>
        <NumberInput
          id={inputId}
          className={styles.numberInputStyled}
          value={quantity}
          onChange={onChange}
          key={quantity}
          min={1}
        />
        <CircularButton
          className={styles.changeButton}
          type="button"
          onClick={() => {
            onChange(quantity + 1);
          }}
          aria-label={t("recipeView:recipeQuantity.increase")}
        >
          <PlusIcon />
        </CircularButton>
      </div>
    </div>
  );
};
