import { TrashIcon } from "@radix-ui/react-icons";
import styles from "./DeleteButton.module.css";

export const DeleteButton = ({ className, ...props }: React.ComponentProps<"button">) => {
  return <button {...props} className={className ? className + " " + styles.deleteButtonComponent : styles.deleteButtonComponent}>
    <TrashIcon />
  </button>;
};
