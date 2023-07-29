import { useEditor, EditorContent } from "@tiptap/react";
import { Button } from "../../button/Button";
import { useTranslation } from "next-i18next";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import { Node } from "@tiptap/core";
import { CountdownExtension } from "../extensions/CountdownExtension";
import { Dialog } from "../../dialog/Dialog";
import { useState } from "react";
import { TimerIcon } from "@radix-ui/react-icons";
import styles from "./InstructionEditor.module.css";
import { NewCountdownDialog } from "./NewCountdownDialog";

const OneLiner = Node.create({
  name: "oneLiner",
  topNode: true,
  content: "block",
});

export type InstructionEditorProps = {
  addInstruction: (instruction: string) => void;
};

export const InstructionEditor = ({
  addInstruction,
}: InstructionEditorProps) => {
  const editor = useEditor({
    extensions: [OneLiner, Paragraph, Text, CountdownExtension],
    content: "",
    editorProps: {
      attributes: {
        class: "instruction-editor instruction-editor-editable",
      },
    },
  });

  const { t } = useTranslation(["common", "recipeView"]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      <Dialog open={isDialogOpen} onClickOutside={() => setIsDialogOpen(false)}>
        <NewCountdownDialog editor={editor} setIsDialogOpen={setIsDialogOpen} />
      </Dialog>
      <div className={styles.container}>
        <EditorContent editor={editor} />
        <div>
          <Button
            onClick={() => {
              setIsDialogOpen(true);
            }}
            variant="secondary"
            size="small"
            style={{ gap: "0.2rem" }}
          >
            <TimerIcon />
            {t("recipeView:edit.misc.countdown.addCountdownButton")}
          </Button>
        </div>
        <Button
          type="submit"
          onClick={() => {
            if (editor) {
              addInstruction(editor.getHTML());
              editor.commands.clearContent();
            } else {
              console.error(
                "Editor was null when trying to add an instruction",
              );
            }
          }}
        >
          {t("recipeView:edit.instructions.newInstructionPlaceholder")}
        </Button>
      </div>
    </>
  );
};
