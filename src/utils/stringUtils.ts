import { SortKey, sorts } from "../components/browse/sort/BrowseSort";

export const capitalize = (str: string) =>
  str.charAt(0).toUpperCase() + str.slice(1);

export const isValidSortParam = (str: string): str is SortKey => {
  const parts = str.split(".");
  return (
    parts.length === 2 &&
    sorts.some((s) => s.sortColumn === parts[0] && s.sortDirection === parts[1])
  );
};

export const queryParamToString = (param: string | string[] | undefined) => {
  if (param === undefined) return undefined;

  if (Array.isArray(param)) {
    return param.length > 0 ? param[0] : undefined;
  }

  return param;
};
