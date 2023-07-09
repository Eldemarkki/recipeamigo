import { useId } from "react";
import { useTranslation } from "next-i18next";
import Select from "react-select/creatable";
import { components } from "react-select";
import { TagType, isSpecialTagValue, tagAdditionalClassname, tagPrefixes, tagTranslationKeys } from "./Tag";
import tagStyles from "./Tag.module.css";
import { DeleteButton } from "../button/DeleteButton";

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

  return <Select
    isMulti
    inputId={id}
    onChange={(selectedOption) => {
      setTags(selectedOption.map((tag) => tag.value));
    }}
    value={tags.map((tag) => ({ value: tag, label: tag }))}
    onCreateOption={(inputValue) => {
      setTags([...tags, inputValue]);
    }}
    formatCreateLabel={(inputValue) => `Add "${inputValue}"`}
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
        color: state.isFocused || state.isSelected ? "var(--text-black)" : "var(--text)",
        backgroundColor: state.isFocused ? "var(--primary-light)" : (state.isSelected ? "var(--primary)" : "var(--background-color)"),
        padding: "0.5rem 0.25rem",
      }),
      valueContainer: (provided) => ({
        ...provided,
        gap: "0.5rem 0.25rem",
      }),
    }}
    components={{
      MultiValueContainer: (props) => {
        const value = props.data.value;
        const className = isSpecialTagValue(value) ? tagAdditionalClassname[value] : undefined;
        return <components.MultiValueContainer {...props}>
          <div className={className + " " + tagStyles.tag}>
            {props.children}
          </div>
        </components.MultiValueContainer>;
      },
      MultiValueRemove: (props) => {
        return <components.MultiValueRemove {...props} innerProps={{
          ...props.innerProps,
          style: {
            backgroundColor: "transparent",
          }
        }} >
          <DeleteButton type="button" />
        </components.MultiValueRemove>;
      },
      MultiValueLabel: (props) => {
        const value = props.data.value;
        const display = isSpecialTagValue(value) ? tagPrefixes[value] + " " + t(tagTranslationKeys[value]) : props.data.label;
        return <components.MultiValueLabel {...props}>
          {display}
        </components.MultiValueLabel>;
      }
    }}
  />;
};
