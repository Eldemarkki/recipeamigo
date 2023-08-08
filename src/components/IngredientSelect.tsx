import type { Locale } from "../i18next";
import { getIngredientDropdownLabel } from "../ingredients/ingredientTranslator";
import { englishIngredients } from "../ingredients/ingredientsEnglish";
import { useTranslation } from "next-i18next";
import { useId } from "react";
import Select from "react-select/creatable";

export type IngredientSelectProps =
  | {
      multi?: false | undefined;
      ingredient: string | null;
      setIngredient: (ingredient: string | null) => void;
    }
  | {
      multi: true;
      ingredients: string[];
      setIngredients: (ingredients: string[]) => void;
    };

export const IngredientSelect = (props: IngredientSelectProps) => {
  const { t, i18n } = useTranslation();

  const instanceId = useId();
  const inputId = useId();

  const predefinedIngredients = Object.keys(englishIngredients).map(
    (ingredientType) => ({
      label: getIngredientDropdownLabel(
        ingredientType,
        i18n.language as Locale,
      ),
      value: ingredientType,
    }),
  );

  if (!props.multi) {
    return (
      <Select
        instanceId={instanceId}
        inputId={inputId}
        onChange={(selectedOption) => {
          props.setIngredient(selectedOption?.value || "");
        }}
        value={
          props.ingredient
            ? {
                value: props.ingredient,
                label: getIngredientDropdownLabel(
                  props.ingredient,
                  i18n.language as Locale,
                ),
              }
            : null
        }
        onCreateOption={(inputValue) => {
          props.setIngredient(inputValue);
        }}
        placeholder={t("recipeView:edit.ingredients.selectPlaceholder")}
        formatCreateLabel={(inputValue) =>
          t("recipeView:edit.ingredients.newIngredientPrompt", {
            name: inputValue,
          })
        }
        options={predefinedIngredients}
        theme={(theme) => ({
          ...theme,
          colors: {
            ...theme.colors,
            neutral0: "var(--background-color)",
            neutral90: "var(--primary)",
            primary25: "var(--primary)",
          },
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
            color:
              state.isFocused || state.isSelected
                ? "var(--text-black)"
                : "var(--text)",
            backgroundColor: state.isFocused
              ? "var(--primary-light)"
              : state.isSelected
              ? "var(--primary)"
              : "var(--background-color)",
            padding: "0.5rem 0.25rem",
          }),
          valueContainer: (provided) => ({
            ...provided,
            gap: "0.5rem 0.25rem",
          }),
          placeholder: (provided) => ({
            ...provided,
            color: "var(--text)",
          }),
        }}
      />
    );
  } else {
    return (
      <Select
        instanceId={instanceId}
        inputId={inputId}
        isMulti
        onChange={(selectedOption) => {
          props.setIngredients(selectedOption.map((option) => option.value));
        }}
        value={props.ingredients.map((i) => ({
          value: i,
          label: getIngredientDropdownLabel(i, i18n.language as Locale),
        }))}
        onCreateOption={(inputValue) => {
          props.setIngredients([...props.ingredients, inputValue]);
        }}
        placeholder={t("recipeView:edit.ingredients.selectPlaceholder")}
        formatCreateLabel={(inputValue) =>
          t("recipeView:edit.ingredients.newIngredientPrompt", {
            name: inputValue,
          })
        }
        options={predefinedIngredients}
        theme={(theme) => ({
          ...theme,
          colors: {
            ...theme.colors,
            neutral0: "var(--background-color)",
            neutral90: "var(--primary)",
            primary25: "var(--primary)",
          },
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
            color:
              state.isFocused || state.isSelected
                ? "var(--text-black)"
                : "var(--text)",
            backgroundColor: state.isFocused
              ? "var(--primary-light)"
              : state.isSelected
              ? "var(--primary)"
              : "var(--background-color)",
            padding: "0.5rem 0.25rem",
          }),
          valueContainer: (provided) => ({
            ...provided,
            gap: "0.5rem 0.25rem",
          }),
          multiValue: (provided) => ({
            ...provided,
            padding: "0.25rem 0.5rem",
            borderRadius: 4,
            gap: 6,
            backgroundColor: "var(--background-color-secondary)",
          }),
          placeholder: (provided) => ({
            ...provided,
            color: "var(--text)",
          }),
        }}
      />
    );
  }
};
