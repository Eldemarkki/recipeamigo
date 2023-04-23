import Link from "next/link";
import styles from "./LinkButton.module.css";
import { PropsWithChildren } from "react";
import { Url } from "next/dist/shared/lib/router/router";

export const LinkButton = ({ href, children }: PropsWithChildren<{
  href: Url
}>) => {
  return <Link
    className={styles.linkButton}
    href={href}
  >
    {children}
  </Link>;
};
