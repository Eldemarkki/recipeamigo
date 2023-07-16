import { useTranslation } from "next-i18next";
import { useId } from "react";
import Select from "react-select";

export const sorts = [
  {
    labelTranslationKey: "sort.likes.desc",
    sortColumn: "like",
    sortDirection: "desc",
  },
  {
    labelTranslationKey: "sort.likes.asc",
    sortColumn: "like",
    sortDirection: "asc",
  },
  {
    labelTranslationKey: "sort.views.desc",
    sortColumn: "view",
    sortDirection: "desc",
  },
  {
    labelTranslationKey: "sort.views.asc",
    sortColumn: "view",
    sortDirection: "asc",
  },
  {
    labelTranslationKey: "sort.updatedAt.desc",
    sortColumn: "updatedAt",
    sortDirection: "desc",
  },
  {
    labelTranslationKey: "sort.updatedAt.asc",
    sortColumn: "updatedAt",
    sortDirection: "asc",
  },
  {
    labelTranslationKey: "sort.createdAt.desc",
    sortColumn: "createdAt",
    sortDirection: "desc",
  },
  {
    labelTranslationKey: "sort.createdAt.asc",
    sortColumn: "createdAt",
    sortDirection: "asc",
  },
  {
    labelTranslationKey: "sort.name.asc",
    sortColumn: "name",
    sortDirection: "desc",
  },
  {
    labelTranslationKey: "sort.name.desc",
    sortColumn: "name",
    sortDirection: "asc",
  },
] as const;

export type SortDirection = "asc" | "desc";
export type SortColumn = typeof sorts[number]["sortColumn"];
export type SortKey = `${SortColumn}.${SortDirection}`;
export type Sort = typeof sorts[number];

export const getSortKey = (sort: Sort): SortKey => `${sort.sortColumn}.${sort.sortDirection}`;

export type BrowseSortProps = {
  sort: Sort;
  onChange: (sort: Sort) => void;
}

export const BrowseSort = ({ sort, onChange }: BrowseSortProps) => {
  const { t } = useTranslation("browse");
  const instanceId = useId();

  return <div>
    <Select
      instanceId={instanceId}
      value={{
        value: sort,
        label: t(sort.labelTranslationKey),
      }}
      options={sorts.map((sort) => ({
        value: sort,
        label: t(sort.labelTranslationKey),
      }))}
      onChange={(option) => {
        if (!option) {
          console.warn("User selected an invalid sort option. This should never happen.");
          return;
        }
        onChange(option.value);
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
    />
  </div>;
};
