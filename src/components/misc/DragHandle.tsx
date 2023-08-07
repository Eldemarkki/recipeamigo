import styles from "./DragHandle.module.css";
import { DragHandleDots2Icon } from "@radix-ui/react-icons";
import type { IconProps } from "@radix-ui/react-icons/dist/types";

export const DragHandle = (props: IconProps) => (
  <DragHandleDots2Icon {...props} className={styles.dragHandle} />
);
