import styles from "./LinkButton.module.css";
import { Link } from "./link/Link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { forwardRef } from "react";

export const LinkButton = forwardRef<
  HTMLAnchorElement,
  ComponentPropsWithoutRef<typeof Link> & {
    rectangular?: boolean;
    variant?: "primary" | "secondary";
    icon?: ReactNode;
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
      {props.icon}
      {children}
    </Link>
  ),
);

LinkButton.displayName = "LinkButton";
