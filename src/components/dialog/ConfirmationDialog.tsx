import { Button, type ButtonVariant } from "../button/Button";
import styles from "./ConfirmationDialog.module.css";
import { Dialog } from "./Dialog";

export type ConfirmationDialogProps = {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  isOpen: boolean;
  cancelButtonVariant?: ButtonVariant;
  cancelButtonText?: string;
  confirmButtonVariant?: ButtonVariant;
  confirmButtonText?: string;
};

export const ConfirmationDialog = ({
  title,
  message,
  onCancel,
  onConfirm,
  isOpen,
  cancelButtonText,
  cancelButtonVariant = "secondary",
  confirmButtonText,
  confirmButtonVariant = "danger",
}: ConfirmationDialogProps) => {
  return (
    <Dialog open={isOpen} showCloseButton={false} closeDialog={onCancel}>
      <h1>{title}</h1>
      <p>{message}</p>
      <div className={styles.buttonRow}>
        <Button variant={cancelButtonVariant} onClick={onCancel}>
          {cancelButtonText}
        </Button>
        <Button variant={confirmButtonVariant} onClick={onConfirm}>
          {confirmButtonText}
        </Button>
      </div>
    </Dialog>
  );
};
