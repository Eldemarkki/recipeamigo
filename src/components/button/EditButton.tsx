import { Pencil1Icon } from "@radix-ui/react-icons";
import { ComponentProps } from "react";
import styles from "./EditButton.module.css";

export const EditButton = ({ className, ...props }: ComponentProps<"button">) => {
  return <button {...props} className={className ? className + " " + styles.editButton : styles.editButton}>
    <Pencil1Icon />
  </button>;
};
