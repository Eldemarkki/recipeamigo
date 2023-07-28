import { useEditor, EditorContent } from "@tiptap/react";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import Document from "@tiptap/extension-document";
import { CountdownExtension } from "./extensions/CountdownExtension";

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
