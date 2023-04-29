import { useState } from "react";
import { Theme, isTheme, useTheme } from "../../hooks/useTheme";

const ThemeToggle = () => {
  const initialTheme = localStorage.getItem("theme");
  const [selectedTheme, setSelectedTheme] = useState<Theme>(isTheme(initialTheme) ? initialTheme : "system");
  const setTheme = useTheme();

  return <div>
    <label htmlFor="theme">Theme</label>
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
      <option value="system">System</option>
      <option value="light">Light</option>
      <option value="dark">Dark</option>
    </select>
  </div>;
};

export default ThemeToggle;
