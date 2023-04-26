import styles from "./LinkButton.module.css";
import { ComponentProps } from "react";
import { Link } from "./link/Link";

export const LinkButton = ({ children, className, ...props }: ComponentProps<typeof Link>) => {
  return <Link
    {...props}
    className={className ? className + " " + styles.linkButton : styles.linkButton}
  >
    {children}
  </Link>;
};
