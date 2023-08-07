import styles from "./ErrorText.module.css";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import type { PropsWithChildren } from "react";

export const ErrorText = (props: PropsWithChildren) => {
  return (
    <div className={styles.container}>
      <div className={styles.icon}>
        <ExclamationTriangleIcon width={20} height={20} />
      </div>
      {props.children}
    </div>
  );
};
