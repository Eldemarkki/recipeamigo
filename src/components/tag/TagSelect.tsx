import { DeleteButton } from "../button/DeleteButton";
import {
  TagType,
  isSpecialTagValue,
  tagAdditionalClassname,
  tagPrefixes,
  tagTranslationKeys,
} from "./Tag";
import tagStyles from "./Tag.module.css";
import { useTranslation } from "next-i18next";
import { useId } from "react";
import { components } from "react-select";
import Select from "react-select/creatable";

export type TagSelectProps = {
  tags: string[];
  setTags: (tags: string[]) => void;
  id?: string | undefined;
};

export const TagSelect = ({ tags, setTags, id }: TagSelectProps) => {
  const { t } = useTranslation();

  const predefinedTags = Object.values(TagType).map((tagType) => ({
    label: tagPrefixes[tagType] + " " + t(tagTranslationKeys[tagType]),
    value: tagType,
  }));

  const instanceId = useId();

  return (
    <Select
      isMulti
      instanceId={instanceId}
      inputId={id}
      onChange={(selectedOption) => {
        setTags(selectedOption.map((tag) => tag.value));
      }}
      value={tags.map((tag) => ({ value: tag, label: tag }))}
      onCreateOption={(inputValue) => {
        setTags([...tags, inputValue]);
      }}
      placeholder={t("recipeView:edit.settings.tagSelectPlaceholder")}
      formatCreateLabel={(inputValue) =>
        t("recipeView:edit.settings.tagSelectFormatCreateLabel", {
          name: inputValue,
        })
      }
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
      options={predefinedTags}
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
      }}
      components={{
        MultiValueContainer: (props) => {
          const data = props.data as unknown;

          const value =
            data &&
            typeof data === "object" &&
            "value" in data &&
            typeof data.value === "string"
              ? data.value
              : undefined;

          const className =
            value && isSpecialTagValue(value)
              ? tagAdditionalClassname[value]
              : undefined;
          return (
            <components.MultiValueContainer {...props}>
              <div className={className + " " + tagStyles.tag}>
                {props.children}
              </div>
            </components.MultiValueContainer>
          );
        },
        MultiValueRemove: (props) => {
          return (
            <components.MultiValueRemove
              {...props}
              innerProps={{
                ...props.innerProps,
                style: {
                  backgroundColor: "transparent",
                },
              }}
            >
              <DeleteButton type="button" />
            </components.MultiValueRemove>
          );
        },
        MultiValueLabel: (props) => {
          const data = props.data as unknown;
          const value =
            data &&
            typeof data === "object" &&
            "value" in data &&
            typeof data.value === "string"
              ? data.value
              : undefined;
          const label =
            data &&
            typeof data === "object" &&
            "label" in data &&
            typeof data.label === "string"
              ? data.label
              : undefined;

          const display =
            value !== undefined && isSpecialTagValue(value)
              ? tagPrefixes[value] + " " + t(tagTranslationKeys[value])
              : label;

          return (
            <components.MultiValueLabel {...props}>
              {display}
            </components.MultiValueLabel>
          );
        },
      }}
    />
  );
};
