import styles from "./InfoDisclaimer.module.css";
import { InfoCircledIcon } from "@radix-ui/react-icons";
import type { PropsWithChildren } from "react";

export const InfoDisclaimer = ({ children }: PropsWithChildren) => {
  return (
    <div className={styles.container}>
      <div className={styles.iconContainer}>
        <InfoCircledIcon height={32} width={32} />
      </div>
      <div>{children}</div>
    </div>
  );
};
