import { splitSeconds } from "../../../utils/recipeUtils";
import { formatDuration } from "../../../utils/stringUtils";
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
  renderText: ({ node }) => {
    const totalSeconds =
      "seconds" in node.attrs && typeof node.attrs.seconds === "number"
        ? node.attrs.seconds
        : 0;
    const { hours, minutes, seconds } = splitSeconds(totalSeconds);
    return formatDuration(hours, minutes, seconds);
  },
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
