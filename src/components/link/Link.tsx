import styles from "./Link.module.css";
import NextLink from "next/link";
import type { ComponentPropsWithoutRef } from "react";
import { forwardRef } from "react";

export const Link = forwardRef<
  HTMLAnchorElement,
  ComponentPropsWithoutRef<typeof NextLink> & {
    unstyled?: boolean;
  }
>(({ className, unstyled, ...props }, ref) => (
  <NextLink
    {...props}
    ref={ref}
    className={
      unstyled
        ? className
        : className
        ? className + " " + styles.link
        : styles.link
    }
  />
));

Link.displayName = "Link";
