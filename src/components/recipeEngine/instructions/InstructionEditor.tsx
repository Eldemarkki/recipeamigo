import { useEditor, EditorContent } from "@tiptap/react";
import { Button } from "../../button/Button";
import { useTranslation } from "next-i18next";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import { Node } from "@tiptap/core";
import { CountdownExtension } from "../extensions/CountdownExtension";
import { Dialog } from "../../dialog/Dialog";
import { useId, useState } from "react";
import { NumberInput } from "../../forms/NumberInput";

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

  const [seconds, setSeconds] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const inputId = useId();

  return (
    <>
      <EditorContent editor={editor} />
      <Dialog open={isDialogOpen} onClickOutside={() => setIsDialogOpen(false)}>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <h1>{t("recipeView:edit.misc.countdown.newCountdownTitle")}</h1>
          <form
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            onSubmit={(e) => {
              e.preventDefault();
              editor?.chain().focus().setCountdown({ seconds }).run();
              setIsDialogOpen(false);
              setSeconds(0);
            }}
          >
            <div style={{ display: "flex", flexDirection: "column" }}>
              <label htmlFor={inputId}>
                {t("recipeView:edit.misc.countdown.durationLabel")}
              </label>
              <NumberInput value={seconds} onChange={setSeconds} id={inputId} />
            </div>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setSeconds(0);
                setIsDialogOpen(false);
              }}
            >
              {t("common:actions.cancel")}
            </Button>
            <Button type="submit">{t("common:actions.save")}</Button>
          </form>
        </div>
      </Dialog>
      <Button
        onClick={() => {
          setIsDialogOpen(true);
        }}
        variant="secondary"
      >
        {t("recipeView:edit.misc.countdown.newCountdownTitle")}
      </Button>
      <Button
        type="submit"
        onClick={() => {
          addInstruction(editor?.getHTML() || "");
          editor?.commands.clearContent();
        }}
      >
        {t("recipeView:edit.instructions.newInstructionPlaceholder")}
      </Button>
    </>
  );
};
