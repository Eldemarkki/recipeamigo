import { CountdownComponent } from "./CountdownComponent";
import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    countdown: {
      setCountdown: (options: { seconds: number }) => ReturnType;
    };
  }
}

export const CountdownExtension = Node.create({
  name: "countdownComponent",
  group: "inline",
  inline: true,
  content: "text*",
  atom: true,
  addAttributes: () => ({ seconds: { isRequired: true } }),
  parseHTML: () => [{ tag: "countdown-component" }],
  renderHTML: ({ HTMLAttributes }) => [
    "countdown-component",
    mergeAttributes(HTMLAttributes),
  ],
  addNodeView: () => ReactNodeViewRenderer(CountdownComponent),
  addCommands: () => ({
    setCountdown:
      ({ seconds }) =>
      ({ commands }) =>
        commands.insertContent({
          type: "countdownComponent",
          attrs: {
            seconds: seconds,
          },
        }),
  }),
});
