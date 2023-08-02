import styles from "./DeleteButton.module.css";
import { TrashIcon } from "@radix-ui/react-icons";

export const DeleteButton = ({
  className,
  ...props
}: React.ComponentProps<"button">) => {
  return (
    <button
      {...props}
      className={
        className
          ? className + " " + styles.deleteButtonComponent
          : styles.deleteButtonComponent
      }
    >
      <TrashIcon />
    </button>
  );
};
