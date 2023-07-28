import { mergeAttributes, Node } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { CountdownComponent } from "./CountdownComponent";

export const CountdownExtension = Node.create({
  name: "countdownComponent",
  group: "inline",
  inline: true,
  content: "text*",
  atom: true,
  addAttributes: () => ({
    seconds: { isRequired: true },
  }),
  parseHTML: () => [
    {
      tag: "countdown-component",
    },
  ],
  renderHTML: ({ HTMLAttributes }) => [
    "countdown-component",
    mergeAttributes(HTMLAttributes),
  ],
  addNodeView: () => ReactNodeViewRenderer(CountdownComponent),
});
