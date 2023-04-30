import { NumberInput } from "../forms/NumberInput";
import { CircularButton } from "../button/Button";
import { MinusIcon, PlusIcon } from "@radix-ui/react-icons";
import styles from "./RecipeQuantityPicker.module.css";
import { useTranslation } from "next-i18next";

export type RecipeQuantityPickerProps = {
  quantity: number;
  onChange: (quantity: number) => void;
};

export const RecipeQuantityPicker = ({ quantity, onChange }: RecipeQuantityPickerProps) => {
  const { t } = useTranslation();

  return <div className={styles.container}>
    <span>{t("recipeView:recipeQuantity.title")}</span>
    <div className={styles.inputContainer}>
      <CircularButton type="button" onClick={() => onChange(Math.max(quantity - 1, 1))} aria-label={t("recipeView:recipeQuantity.decrease")}>
        <MinusIcon />
      </CircularButton>
      <NumberInput className={styles.numberInputStyled} value={quantity} onChange={onChange} key={quantity} min={1} />
      <CircularButton type="button" onClick={() => onChange(quantity + 1)} aria-label={t("recipeView:recipeQuantity.increase")}>
        <PlusIcon />
      </CircularButton>
    </div>
  </div>;
};
