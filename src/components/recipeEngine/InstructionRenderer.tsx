import { useEditor, EditorContent } from "@tiptap/react";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import { Node } from "@tiptap/core";

const OneLiner = Node.create({
  name: "oneLiner",
  topNode: true,
  content: "block",
});

export type InstructionListItemProps = {
  instruction: string;
};

export const InstructionRenderer = ({
  instruction,
}: InstructionListItemProps) => {
  const editor = useEditor({
    extensions: [OneLiner, Paragraph, Text],
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
