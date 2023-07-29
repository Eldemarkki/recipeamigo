import {
  Cross1Icon,
  EnterFullScreenIcon,
  PauseIcon,
  PlayIcon,
  SymbolIcon,
} from "@radix-ui/react-icons";
import { NodeViewRendererProps, NodeViewWrapper } from "@tiptap/react";
import React, { useEffect, useState } from "react";
import { CircularButton } from "../../button/Button";
import { splitSeconds } from "../../../utils/recipeUtils";
import { Dialog } from "../../dialog/Dialog";
import styles from "./CountdownComponent.module.css";
import screenfull from "screenfull";

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

  const { hours, minutes, seconds } = splitSeconds(secondsLeft);
  const suffix = ["h", "min", "s"];

  const formattedTimeLeft =
    [hours, minutes, seconds]
      .reduce(
        (acc, curr, i) => (curr === 0 ? acc : `${acc}${curr}${suffix[i]} `),
        "",
      )
      .trim() || "0s";

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  return (
    <NodeViewWrapper className="countdown-component" as="span">
      {isDialogOpen && (
        <Dialog open={isDialogOpen} unstyled className={styles.dialog}>
          <span className={styles.dialogText}>{formattedTimeLeft}</span>
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
          <div className={styles.dialogCloseButton}>
            <CircularButton
              onClick={() => {
                screenfull.exit();
                setIsDialogOpen(false);
              }}
            >
              <Cross1Icon />
            </CircularButton>
          </div>
        </Dialog>
      )}
      <span>{formattedTimeLeft}</span>{" "}
      <div className={styles.controlButtonsContainer}>
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
        {hasRanOnce && (
          <CircularButton>
            <EnterFullScreenIcon
              onClick={() => {
                if (screenfull.isEnabled) {
                  screenfull.request();
                }
                setIsDialogOpen(true);
              }}
            />
          </CircularButton>
        )}
      </div>
    </NodeViewWrapper>
  );
};
