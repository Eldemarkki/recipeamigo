import { ComponentProps } from "react";
import NextLink from "next/link";
import styles from "./Link.module.css";

export const Link = ({
  className,
  ...props
}: ComponentProps<typeof NextLink>) => {
  return (
    <NextLink
      {...props}
      className={className ? styles.link + " " + className : styles.link}
    />
  );
};
