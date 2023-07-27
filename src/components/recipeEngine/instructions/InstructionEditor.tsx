import { useEditor, EditorContent } from "@tiptap/react";
import { Button } from "../../button/Button";
import { useTranslation } from "next-i18next";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import { Node } from "@tiptap/core";

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
    extensions: [OneLiner, Paragraph, Text],
    content: "",
    editorProps: {
      attributes: {
        class: "instruction-editor instruction-editor-editable",
      },
    },
  });

  const { t } = useTranslation("recipeView");

  return (
    <>
      <EditorContent editor={editor} />
      <Button
        type="submit"
        onClick={() => {
          addInstruction(editor?.getHTML() || "");
          editor?.commands.clearContent();
        }}
      >
        {t("edit.instructions.newInstructionPlaceholder")}
      </Button>
    </>
  );
};
