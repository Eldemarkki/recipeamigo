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
>(({ className, rectangular = false, variant = "primary", ...props }, ref) => (
  <Link
    {...props}
    ref={ref}
    className={[
      styles[variant],
      rectangular ? styles.rectangular : "",
      styles.linkButton,
      className,
    ].join(" ")}
    unstyled
  />
));

LinkButton.displayName = "LinkButton";
