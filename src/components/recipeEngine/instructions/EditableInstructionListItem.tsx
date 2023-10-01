import { DeleteButton } from "../../button/DeleteButton";
import { EditButton } from "../../button/EditButton";
import { Dialog } from "../../dialog/Dialog";
import { DragHandle } from "../../misc/DragHandle";
import { InstructionRenderer } from "../InstructionRenderer";
import type { RawInstruction } from "../ingredients/IngredientForm";
import styles from "./EditableInstructionListItem.module.css";
import { InstructionEditor } from "./InstructionEditor";
import { Reorder, useDragControls } from "framer-motion";
import { useTranslation } from "next-i18next";
import { useState } from "react";

export type InstructionListProps = {
  instruction: RawInstruction & {
    id?: string;
  };
  updateInstruction: (instruction: string) => void;
  onRemoveInstruction: () => void;
};

export const EditableInstructionListItem = ({
  instruction,
  onRemoveInstruction,
  updateInstruction,
}: InstructionListProps) => {
  const { t } = useTranslation(["common", "recipeView"]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const controls = useDragControls();

  return (
    <Reorder.Item
      value={instruction}
      key={instruction.description}
      dragListener={false}
      dragControls={controls}
      className={styles.instructionListItem}
    >
      <Dialog
        title={t("recipeView:edit.editingInstructionTitle")}
        open={dialogOpen}
        closeDialog={() => {
          setDialogOpen(false);
        }}
      >
        <InstructionEditor
          initialContent={instruction.description}
          onSave={(instruction) => {
            updateInstruction(instruction);
            setDialogOpen(false);
          }}
          buttonText={t("actions.save")}
        />
      </Dialog>
      <DragHandle
        onPointerDown={(e) => {
          controls.start(e);
          e.preventDefault();
        }}
      />
      <DeleteButton onClick={onRemoveInstruction} />
      <EditButton
        onClick={() => {
          setDialogOpen(true);
        }}
      />
      <InstructionRenderer instruction={instruction.description} />
    </Reorder.Item>
  );
};
