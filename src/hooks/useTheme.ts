import { useEffect } from "react";

export const THEMES = ["system", "light", "dark"] as const;
export type Theme = (typeof THEMES)[number];
export const isTheme = (value: string | null | undefined): value is Theme =>
  THEMES.includes(value as Theme);

const setTheme = (theme: Theme) => {
  if (theme === "system") {
    document.documentElement.removeAttribute("data-theme");
  } else {
    document.documentElement.setAttribute("data-theme", theme);
  }
};

export const useTheme = (afterLoading?: (theme: Theme) => void) => {
  useEffect(() => {
    const initialTheme = localStorage.getItem("theme");
    const theme = isTheme(initialTheme) ? initialTheme : "system";
    afterLoading?.(theme);
    setTheme(theme);
  }, [afterLoading]);

  return (theme: Theme) => {
    localStorage.setItem("theme", theme);
    setTheme(theme);
  };
};
