import styles from "./PageWrapper.module.css";
import type { PropsWithChildren } from "react";

export type PageWrapperProps = PropsWithChildren<
  (
    | {
        title?: null;
      }
    | {
        title: string;
      }
    | {
        titleRow: React.ReactNode;
      }
  ) & {
    mainClass?: string;
    maxWidth?: React.CSSProperties["maxWidth"];
  }
>;

export const PageWrapper = ({
  maxWidth = 1600,
  ...props
}: PageWrapperProps) => {
  return (
    <div className={styles.wrapper}>
      <div
        className={styles.content}
        style={{
          maxWidth,
        }}
      >
        {"title" in props ? (
          <h1>{props.title}</h1>
        ) : "titleRow" in props ? (
          props.titleRow
        ) : null}
        <main className={props.mainClass}>{props.children}</main>
      </div>
    </div>
  );
};
