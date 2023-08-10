import styles from "./Dialog.module.css";
import type { PropsWithChildren } from "react";
import { useEffect, useRef, useState } from "react";

export type DialogProps = PropsWithChildren<{
  open: boolean;
  onClickOutside?: () => void;
  unstyled?: boolean;
  className?: string;
  maxWidth?: React.CSSProperties["maxWidth"] | null;
}>;

export const Dialog = ({
  open,
  onClickOutside,
  children,
  unstyled,
  className,
  maxWidth = 600,
}: DialogProps) => {
  const [isActuallyOpen, setIsActuallyOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

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
        open
      ) {
        onClickOutside?.();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open, dialogRef, onClickOutside]);

  const finalClassName = [unstyled ? undefined : styles.dialog, className]
    .filter(Boolean)
    .join(" ");

  return (
    <dialog
      className={finalClassName}
      ref={dialogRef}
      open={isActuallyOpen}
      style={{ maxWidth: maxWidth === null ? undefined : maxWidth }}
    >
      {isActuallyOpen && children}
    </dialog>
  );
};
