import type { Theme } from "../../hooks/useTheme";
import { isTheme, useTheme } from "../../hooks/useTheme";
import { Select } from "../Select";
import { useTranslation } from "next-i18next";
import { useState } from "react";

const ThemeToggle = () => {
  const { t } = useTranslation("settings");

  const [selectedTheme, setSelectedTheme] = useState<Theme>("system");
  const setTheme = useTheme((theme) => {
    setSelectedTheme(theme);
  });

  const options = [
    { value: "system", label: t("themes.systemTheme") },
    { value: "light", label: t("themes.lightTheme") },
    { value: "dark", label: t("themes.darkTheme") },
  ] as const;

  return (
    <div>
      <label htmlFor="theme">{t("themes.themeTitle")}</label>
      <Select
        id="theme"
        options={options}
        value={options.find((option) => option.value === selectedTheme)}
        onChange={(option) => {
          const newTheme = option?.value;
          if (!isTheme(newTheme))
            throw new Error("Invalid theme. This should never happen.");
          setTheme(newTheme);
          setSelectedTheme(newTheme);
        }}
      />
    </div>
  );
};

export default ThemeToggle;
