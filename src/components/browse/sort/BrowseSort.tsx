import { Select } from "../../Select";
import { useTranslation } from "next-i18next";
import { useId } from "react";

export const sorts = [
  "likes.desc",
  "likes.asc",
  "views.desc",
  "views.asc",
  "updatedAt.desc",
  "updatedAt.asc",
  "createdAt.desc",
  "createdAt.asc",
  "name.asc",
  "name.desc",
] as const;

export type SortDirection = "asc" | "desc";
export type SortKey = (typeof sorts)[number];
export type SortColumn = SortKey extends `${infer A}.${string}` ? A : never;

export type BrowseSortProps = {
  sort: SortKey;
  onChange: (sort: SortKey) => void;
};

const getTranslationKey = (sort: SortKey) =>
  ("sort." + sort) as `sort.${SortKey}`;

export const BrowseSort = ({ sort, onChange }: BrowseSortProps) => {
  const { t } = useTranslation("browse");

  const selectId = useId();
  return (
    <div style={{ width: "100%" }}>
      <label htmlFor={selectId}>{t("labels.sort")}</label>
      <Select
        id={selectId}
        value={{
          value: sort,
          label: t(getTranslationKey(sort)),
        }}
        options={sorts.map((sort) => ({
          value: sort,
          label: t(getTranslationKey(sort)),
        }))}
        onChange={(option) => {
          if (!option) {
            console.warn(
              "User selected an invalid sort option. This should never happen.",
            );
            return;
          }
          onChange(option.value);
        }}
      />
    </div>
  );
};
