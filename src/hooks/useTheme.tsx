import { useEffect } from "react";

export const THEMES = ["system", "light", "dark"] as const;
export type Theme = typeof THEMES[number];
export const isTheme = (value: unknown): value is Theme => THEMES.includes(value as any);

const setTheme = (theme: Theme) => {
  if (theme === "system") {
    document.documentElement.removeAttribute("data-theme");
  } else {
    document.documentElement.setAttribute("data-theme", theme);
  }
};

export const useTheme = () => {
  useEffect(() => {
    const initialTheme = localStorage.getItem("theme");
    const theme = isTheme(initialTheme) ? initialTheme : "system";
    setTheme(theme);
  }, []);

  return (theme: Theme) => {
    localStorage.setItem("theme", theme);
    setTheme(theme);
  };
};