import styles from "./Link.module.css";
import NextLink from "next/link";
import { ComponentProps } from "react";

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
