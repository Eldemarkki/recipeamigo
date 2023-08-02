import styles from "./LinkButton.module.css";
import { Link } from "./link/Link";
import { ComponentProps } from "react";

export const LinkButton = ({
  children,
  className,
  ...props
}: ComponentProps<typeof Link>) => {
  return (
    <Link
      {...props}
      className={
        className ? className + " " + styles.linkButton : styles.linkButton
      }
    >
      {children}
    </Link>
  );
};
