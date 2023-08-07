import styles from "./CrossOffText.module.css";
import { useState } from "react";

export type CrossOffTextProps = React.PropsWithChildren;

export const CrossOffText = ({ children }: CrossOffTextProps) => {
  const [checked, setChecked] = useState(false);

  return (
    <label className={styles.label + (checked ? " " + styles.crossed : "")}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => {
          setChecked(e.target.checked);
        }}
      />
      {children}
    </label>
  );
};
