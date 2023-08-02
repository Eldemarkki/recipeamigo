import { CountdownExtension } from "./extensions/CountdownExtension";
import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import { EditorContent, useEditor } from "@tiptap/react";

export type InstructionListItemProps = {
  instruction: string;
};

export const InstructionRenderer = ({
  instruction,
}: InstructionListItemProps) => {
  const editor = useEditor({
    extensions: [Document, Paragraph, Text, CountdownExtension],
    content: instruction,
    editorProps: {
      attributes: {
        class: "instruction-editor instruction-editor-readonly",
      },
    },
    editable: false,
  });

  return <EditorContent editor={editor} />;
};
