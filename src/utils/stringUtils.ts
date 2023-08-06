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

export const locales = ["en", "fi"] as const;

export type Locale = (typeof locales)[number];

export const isLocale = (str: string): str is Locale => {
  return locales.includes(str as any);
};

export const formatDuration = (
  hours: number,
  minutes: number,
  seconds: number,
) => {
  const suffix = ["h", "min", "s"];

  const formattedTimeLeft =
    [hours, minutes, seconds]
      .reduce(
        (acc, curr, i) => (curr === 0 ? acc : `${acc}${curr}${suffix[i]} `),
        "",
      )
      .trim() || "0s";

  return formattedTimeLeft;
};
