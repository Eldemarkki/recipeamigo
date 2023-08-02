import { InstructionRenderer } from "../recipeEngine/InstructionRenderer";
import { CrossOffText } from "./CrossOffText";
import styles from "./InstructionsList.module.css";
import { Instruction } from "@prisma/client";

export type InstructionsListProps = {
  instructions: Instruction[];
};

export const InstructionsList = (props: InstructionsListProps) => {
  return (
    <ol className={styles.list}>
      {props.instructions.map((instruction) => (
        <li className={styles.listItem} key={instruction.id}>
          <CrossOffText>
            <InstructionRenderer instruction={instruction.description} />
          </CrossOffText>
        </li>
      ))}
    </ol>
  );
};
