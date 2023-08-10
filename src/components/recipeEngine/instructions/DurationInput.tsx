import { splitSeconds } from "../../../utils/recipeUtils";
import { NumberInput } from "../../forms/NumberInput";
import styles from "./DurationInput.module.css";
import { useTranslation } from "next-i18next";
import { useId } from "react";

export type DurationInputProps = {
  seconds: number;
  setSeconds: (seconds: number) => void;
};

export const DurationInput = ({
  seconds: totalSeconds,
  setSeconds,
}: DurationInputProps) => {
  const { t } = useTranslation("recipeView");

  const { hours, minutes, seconds } = splitSeconds(totalSeconds);

  const hourId = useId();
  const minuteId = useId();
  const secondId = useId();
  const totalSecondsId = useId();

  return (
    <div className={styles.container}>
      <label htmlFor={hourId} className={styles.label}>
        {t("edit.misc.countdown.duration.hours")}
      </label>
      <NumberInput
        value={hours}
        onChange={(hours) => {
          setSeconds(hours * 3600 + minutes * 60 + seconds);
        }}
        id={hourId}
        key={"hour-" + totalSeconds}
        className={styles.input}
      />
      <label htmlFor={minuteId} className={styles.label}>
        {t("edit.misc.countdown.duration.minutes")}
      </label>
      <NumberInput
        value={minutes}
        onChange={(minutes) => {
          setSeconds(hours * 3600 + minutes * 60 + seconds);
        }}
        id={minuteId}
        key={"minute-" + totalSeconds}
        className={styles.input}
      />
      <label htmlFor={secondId} className={styles.label}>
        {t("edit.misc.countdown.duration.seconds")}
      </label>
      <NumberInput
        value={seconds}
        onChange={(seconds) => {
          setSeconds(hours * 3600 + minutes * 60 + seconds);
        }}
        id={secondId}
        key={"second-" + totalSeconds}
        className={styles.input}
      />
      <label htmlFor={totalSecondsId} className={styles.totalLabel}>
        {t("edit.misc.countdown.duration.totalSeconds")}
      </label>
      <div className={styles.totalInputContainer}>
        <NumberInput
          className={styles.totalInput}
          value={totalSeconds}
          onChange={(totalSeconds) => {
            setSeconds(totalSeconds);
          }}
          id={totalSecondsId}
          key={"total-" + totalSeconds}
        />
      </div>
    </div>
  );
};
