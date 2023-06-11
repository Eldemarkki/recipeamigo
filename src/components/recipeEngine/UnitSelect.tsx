import { IngredientUnit } from "@prisma/client";
import { useTranslation } from "next-i18next";
import Select from "react-select";
import { UNIT_SELECT_TRANSLATION_KEYS } from "../../utils/units";

export type UnitSelectProps = {
  value: IngredientUnit | null;
  onChange: (value: IngredientUnit | null) => void;
};

const units = Object.keys(IngredientUnit) as IngredientUnit[];

type UnitOrEmpty = IngredientUnit | "";

export const UnitSelect = (props: UnitSelectProps) => {
  const { t } = useTranslation();

  const options: { value: UnitOrEmpty; label: string; }[] = [
    { value: "", label: t("recipeView:edit.ingredients.noUnit") },
    ...units.map((unit) => ({
      value: unit,
      label: t(UNIT_SELECT_TRANSLATION_KEYS[unit])
    })),
  ];

  return <Select
    options={options}
    value={props.value ? { value: props.value, label: t(UNIT_SELECT_TRANSLATION_KEYS[props.value]) } : {
      value: "" as UnitOrEmpty,
      label: t("recipeView:edit.ingredients.noUnit"),
    }}
    onChange={(option) => {
      const value = option && option.value !== "" ? option.value : null;
      return props.onChange(value);
    }}
    unstyled
    styles={{
      control: (provided) => ({
        ...provided,
        border: "1px solid var(--text)",
        padding: "0.25rem",
        minWidth: "10rem",
      }),
      menu: (provided) => ({
        ...provided,
        width: "max-content",
        backgroundColor: "var(--background-color)",
        border: "1px solid var(--text)",
        marginTop: 16,
      }),
      menuList: (provided) => ({
        ...provided,
        display: "flex",
        flexDirection: "column",
        gap: "0.25rem",
        padding: "0.25rem"
      }),
      option: (provided, state) => ({
        ...provided,
        color: state.isFocused || state.isSelected ? "var(--text-black)" : "var(--text)",
        backgroundColor: state.isFocused ? "var(--primary-light)" : (state.isSelected ? "var(--primary)" : "var(--background-color)"),
        paddingBlock: "0.5rem",
        paddingInline: "0.25rem 2rem",
      }),
      valueContainer: (provided) => ({
        ...provided,
        gap: "0.5rem 0.25rem",
      }),
    }}
  />;
};
