import styles from "./CrossOffText.module.css";
import { useState } from "react";

export type CrossOffText = React.PropsWithChildren<{}>;

export const CrossOffText = ({ children }: CrossOffText) => {
  const [checked, setChecked] = useState(false);

  return (
    <label className={styles.label + (checked ? " " + styles.crossed : "")}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => setChecked(e.target.checked)}
      />
      {children}
    </label>
  );
};
