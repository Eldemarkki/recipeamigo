import { useEditor, EditorContent } from "@tiptap/react";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import { Node } from "@tiptap/core";
import Document from "@tiptap/extension-document";
import { CountdownExtension } from "./extensions/CountdownExtension";

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
    extensions: [Document, Paragraph, Text, CountdownExtension],
    content:
      "<p>Bake potatoes for 5 minutes (<countdown-component seconds=300></countdown-component>)</p>",
    editorProps: {
      attributes: {
        class: "instruction-editor instruction-editor-readonly",
      },
    },
    editable: false,
  });

  return <EditorContent editor={editor} />;
};
