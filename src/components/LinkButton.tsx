import Link from "next/link";
import styles from "./LinkButton.module.css";
import { ComponentProps } from "react";

export const LinkButton = ({ children, ...props }: ComponentProps<typeof Link>) => {
  return <Link
    {...props}
    className={styles.linkButton}
  >
    {children}
  </Link>;
};
