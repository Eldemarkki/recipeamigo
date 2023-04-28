import { PropsWithChildren, useEffect, useRef, useState } from "react";
import styles from "./Dialog.module.css";

export type DialogProps = PropsWithChildren<{
  open: boolean;
  onClickOutside?: () => void;
}>;

export const Dialog = ({ open, onClickOutside, children }: DialogProps) => {
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
      if (dialogRef && dialogRef.current && event.target instanceof Node && !dialogRef.current.contains(event.target) && open) {
        onClickOutside?.();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open, dialogRef, onClickOutside]);

  return <dialog className={styles.dialog} ref={dialogRef} open={isActuallyOpen}>
    {isActuallyOpen && children}
  </dialog>;
};
