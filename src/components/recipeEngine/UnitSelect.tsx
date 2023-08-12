import { Select } from "../Select";
import { IngredientUnit } from "@prisma/client";
import { useTranslation } from "next-i18next";

export type UnitSelectProps = {
  value: IngredientUnit | null;
  onChange: (value: IngredientUnit | null) => void;
};

const units = Object.keys(IngredientUnit) as IngredientUnit[];

export const UnitSelect = (props: UnitSelectProps) => {
  const { t } = useTranslation(["recipeView", "units"]);

  const options = [
    { value: "", label: t("edit.ingredients.noUnit") },
    ...units.map((unit) => ({
      value: unit,
      label: t(`units:unitSelect.${unit}`),
    })),
  ] as const;

  return (
    <Select
      options={options}
      value={
        props.value
          ? {
              value: props.value,
              label: t(`units:unitSelect.${props.value}`),
            }
          : {
              value: "" as const,
              label: t("edit.ingredients.noUnit"),
            }
      }
      onChange={(option) => {
        const value = option && option.value !== "" ? option.value : null;
        props.onChange(value);
      }}
      noOptionsMessage={({ inputValue }) =>
        t("edit.ingredients.noUnitFound", { query: inputValue })
      }
    />
  );
};
