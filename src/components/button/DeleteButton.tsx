import { TrashIcon } from "@radix-ui/react-icons";
import styles from "./DeleteButton.module.css";

export const DeleteButton = (props: React.ComponentProps<"button">) => {
  return <button {...props} className={styles.deleteButtonComponent}>
    <TrashIcon />
  </button>;
};
