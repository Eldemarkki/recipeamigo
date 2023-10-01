import { CircularButton } from "../button/Button";
import styles from "./Dialog.module.css";
import { Cross1Icon } from "@radix-ui/react-icons";
import { useTranslation } from "next-i18next";
import type { PropsWithChildren } from "react";
import { useEffect, useRef, useState } from "react";

export type DialogProps = PropsWithChildren<{
  open: boolean;
  closeDialog?: () => void;
  unstyled?: boolean;
  className?: string;
  maxWidth?: React.CSSProperties["maxWidth"] | null;
  overflowVisible?: boolean | undefined | null;
  title?: string;
  showCloseButton?: boolean;
}>;

export const Dialog = ({
  open,
  closeDialog,
  children,
  unstyled,
  className,
  maxWidth = 600,
  overflowVisible = false,
  title,
  showCloseButton = true,
}: DialogProps) => {
  const [isActuallyOpen, setIsActuallyOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const { t } = useTranslation("common");

  useEffect(() => {
    if (dialogRef.current) {
      if (open) {
        setIsActuallyOpen(true);
        dialogRef.current.showModal();
      } else {
        setIsActuallyOpen(false);
        dialogRef.current.close();
      }
    }
  }, [open, dialogRef]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dialogRef.current &&
        event.target instanceof Node &&
        !dialogRef.current.contains(event.target) &&
        open &&
        // If any child dialog is open, don't close this one. This makes it so
        // that only the topmost dialog will be closed.
        !Array.from(dialogRef.current.querySelectorAll("dialog")).some(
          (d) => d.open,
        )
      ) {
        closeDialog?.();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open, dialogRef, closeDialog]);

  const finalClassName = [unstyled ? undefined : styles.dialog, className]
    .filter(Boolean)
    .join(" ");

  return (
    <dialog
      className={finalClassName}
      ref={dialogRef}
      open={isActuallyOpen}
      style={{
        maxWidth: maxWidth === null ? undefined : maxWidth,
        overflow: overflowVisible ? "visible" : undefined,
      }}
    >
      {isActuallyOpen && (
        <div className={styles.content}>
          <div
            className={styles.titleRow + (!title ? " " + styles.noTitle : "")}
          >
            {title && <h1>{title}</h1>}
            {showCloseButton && (
              <CircularButton
                onClick={() => {
                  closeDialog?.();
                }}
                aria-label={t("dialog.closeLabel")}
              >
                <Cross1Icon />
              </CircularButton>
            )}
          </div>
          {children}
        </div>
      )}
    </dialog>
  );
};
