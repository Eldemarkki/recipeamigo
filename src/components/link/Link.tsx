import styles from "./Link.module.css";
import NextLink from "next/link";
import type { ComponentPropsWithoutRef } from "react";
import { forwardRef } from "react";

export const Link = forwardRef<
  HTMLAnchorElement,
  ComponentPropsWithoutRef<typeof NextLink>
>(({ className, ...props }, ref) => (
  <NextLink
    {...props}
    ref={ref}
    className={className ? styles.link + " " + className : styles.link}
  />
));

Link.displayName = "Link";
