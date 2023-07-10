import { useId } from "react";
import Select from "react-select/creatable";
import { englishIngredients, getIngredientDropdownLabel } from "../ingredients/ingredientTranslator";
import { useTranslation } from "next-i18next";
import { Locale } from "../i18next";

export type IngredientSelectProps = {
  ingredient: string | null;
  setIngredient: (ingredient: string | null) => void;
};

export const IngredientSelect = ({ ingredient, setIngredient }: IngredientSelectProps) => {
  const { t, i18n } = useTranslation();

  const instanceId = useId();
  const inputId = useId();

  const predefinedIngredients = Object.keys(englishIngredients).map((ingredientType) => ({
    label: getIngredientDropdownLabel(ingredientType, i18n.language as Locale),
    value: ingredientType,
  }));

  return <Select
    instanceId={instanceId}
    inputId={inputId}
    onChange={(selectedOption) => {
      setIngredient(selectedOption?.value || "");
    }}
    value={ingredient ? { value: ingredient, label: getIngredientDropdownLabel(ingredient, i18n.language as Locale) } : null}
    onCreateOption={(inputValue) => {
      setIngredient(inputValue);
    }}
    placeholder={t("recipeView:edit.ingredients.selectPlaceholder")}
    formatCreateLabel={(inputValue) => t("recipeView:edit.ingredients.newIngredientPrompt", { name: inputValue })}
    options={predefinedIngredients}
    theme={(theme) => ({
      ...theme,
      colors: {
        ...theme.colors,
        neutral0: "var(--background-color)",
        neutral90: "var(--primary)",
        primary25: "var(--primary)",
      }
    })}
    unstyled
    styles={{
      control: (provided) => ({
        ...provided,
        border: "1px solid var(--text)",
        padding: "0.25rem",
      }),
      menu: (provided) => ({
        ...provided,
        backgroundColor: "var(--background-color)",
        border: "1px solid var(--text)",
        marginTop: 16,
        padding: "0.25rem",
      }),
      menuList: (provided) => ({
        ...provided,
        display: "flex",
        flexDirection: "column",
        gap: "0.25rem",
      }),
      option: (provided, state) => ({
        ...provided,
        color: state.isFocused || state.isSelected ? "var(--text-black)" : "var(--text)",
        backgroundColor: state.isFocused ? "var(--primary-light)" : (state.isSelected ? "var(--primary)" : "var(--background-color)"),
        padding: "0.5rem 0.25rem",
      }),
      valueContainer: (provided) => ({
        ...provided,
        gap: "0.5rem 0.25rem",
      }),
      placeholder: (provided) => ({
        ...provided,
        color: "var(--text)",
      })
    }}
  />;
};
