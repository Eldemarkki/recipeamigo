import { useId } from "react";
import type { GroupBase } from "react-select";
import SelectComponent from "react-select";
import type { StateManagerProps } from "react-select/dist/declarations/src/useStateManager";

export const Select = <
  Option,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>,
>(
  props: StateManagerProps<Option, IsMulti, Group>,
) => {
  const instanceId = useId();

  return (
    <SelectComponent
      instanceId={instanceId}
      unstyled
      styles={{
        ...props.styles,
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
          padding: "0.25rem",
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
          paddingBlock: "0.5rem",
          paddingInline: "0.25rem 2rem",
        }),
        valueContainer: (provided) => ({
          ...provided,
          gap: "0.5rem 0.25rem",
        }),
      }}
      {...props}
    />
  );
};
