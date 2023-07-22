import { Instruction } from "@prisma/client";
import { CrossOffText } from "./CrossOffText";
import styles from "./InstructionsList.module.css";

export type InstructionsListProps = {
  instructions: Instruction[];
};

export const InstructionsList = (props: InstructionsListProps) => {
  return (
    <ol className={styles.list}>
      {props.instructions.map((instruction) => (
        <li className={styles.listItem} key={instruction.id}>
          <CrossOffText>{instruction.description}</CrossOffText>
        </li>
      ))}
    </ol>
  );
};
