import { InstructionRenderer } from "../recipeEngine/InstructionRenderer";
import { CrossOffText } from "./CrossOffText";
import styles from "./InstructionsList.module.css";
import type { Instruction } from "@prisma/client";
import { useTranslation } from "next-i18next";

export type InstructionsListProps = {
  instructions: Instruction[];
};

export const InstructionsList = (props: InstructionsListProps) => {
  const { t } = useTranslation("recipeView");
  if (props.instructions.length === 0) {
    return <p>{t("instructions.noInstructions")}</p>;
  }

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
