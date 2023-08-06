import styles from "./LinkButton.module.css";
import { Link } from "./link/Link";
import { ComponentPropsWithoutRef, forwardRef } from "react";

export const LinkButton = forwardRef<
  HTMLAnchorElement,
  ComponentPropsWithoutRef<typeof Link> & {
    rectangular?: boolean;
    variant?: "primary" | "secondary";
  }
>(
  (
    { children, className, rectangular = false, variant = "primary", ...props },
    ref,
  ) => (
    <Link
      {...props}
      ref={ref}
      className={[
        className,
        styles.linkButton,
        rectangular && styles.rectangular,
        styles[variant],
      ].join(" ")}
    >
      {children}
    </Link>
  ),
);

LinkButton.displayName = "LinkButton";
