import { CrossOffText } from "./CrossOffText";
import styles from "./InstructionsList.module.css";

export type InstructionsListProps = {
  instructions: string[];
}

export const InstructionsList = (props: InstructionsListProps) => {
  return <ol className={styles.list}>
    {props.instructions.map(instruction => <li className={styles.listItem} key={instruction}>
      <CrossOffText>{instruction}</CrossOffText>
    </li>)}
  </ol>;
};
