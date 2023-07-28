import { PauseIcon, PlayIcon, SymbolIcon } from "@radix-ui/react-icons";
import { NodeViewRendererProps, NodeViewWrapper } from "@tiptap/react";
import React, { useEffect } from "react";
import { CircularButton } from "../../button/Button";

export type CountdownComponentProps = {
  seconds: number;
};

export const CountdownComponent = (
  props: NodeViewRendererProps & CountdownComponentProps,
) => {
  const initialSeconds = props.seconds ?? props.node.attrs.seconds;

  const [secondsLeft, setSecondsLeft] = React.useState(
    typeof initialSeconds === "number"
      ? initialSeconds
      : parseInt(initialSeconds, 10),
  );
  const [isPaused, setIsPaused] = React.useState(true);
  const [hasRanOnce, setHasRanOnce] = React.useState(false);

  useEffect(() => {
    if (isPaused) {
      return;
    }

    const interval = setInterval(() => {
      setSecondsLeft((secondsLeft) => secondsLeft - 1);
      if (secondsLeft === 1) {
        setIsPaused(true);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused, secondsLeft]);

  return (
    <NodeViewWrapper className="countdown-component" as="span">
      <span>{secondsLeft} seconds left</span>{" "}
      <CircularButton
        style={{ display: "inline" }}
        onClick={() => {
          setIsPaused(false);
          setSecondsLeft(initialSeconds);
          setHasRanOnce(true);
        }}
      >
        {hasRanOnce ? (
          <SymbolIcon style={{ pointerEvents: "none" }} />
        ) : (
          <PlayIcon style={{ pointerEvents: "none" }} />
        )}
      </CircularButton>
      {hasRanOnce && secondsLeft !== 0 && (
        <CircularButton
          style={{ display: "inline" }}
          onClick={() => setIsPaused(!isPaused)}
        >
          {isPaused ? (
            <PlayIcon style={{ pointerEvents: "none" }} />
          ) : (
            <PauseIcon style={{ pointerEvents: "none" }} />
          )}
        </CircularButton>
      )}
    </NodeViewWrapper>
  );
};
