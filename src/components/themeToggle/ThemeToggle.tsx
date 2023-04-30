import { useState } from "react";
import { Theme, isTheme, useTheme } from "../../hooks/useTheme";
import { useTranslation } from "next-i18next";

const ThemeToggle = () => {
  const { t } = useTranslation("settings");

  const [selectedTheme, setSelectedTheme] = useState<Theme>("system");
  const setTheme = useTheme(theme => setSelectedTheme(theme));

  return <div>
    <label htmlFor="theme">{t("themes.themeTitle")}</label>
    <select
      id="theme"
      value={selectedTheme}
      onChange={e => {
        const newTheme = e.target.value;
        if (!isTheme(newTheme)) throw new Error("Invalid theme. This should never happen.");
        setTheme(newTheme);
        setSelectedTheme(newTheme);
      }}
    >
      <option value="system">{t("themes.systemTheme")}</option>
      <option value="light">{t("themes.lightTheme")}</option>
      <option value="dark">{t("themes.darkTheme")}</option>
    </select>
  </div>;
};

export default ThemeToggle;
