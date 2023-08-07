import styles from "./NumberInput.module.css";
import type { ComponentProps } from "react";
import { useState } from "react";

export type NumberInputProps = Omit<
  ComponentProps<"input">,
  "onChange" | "onBlur" | "type"
> & {
  onChange: (value: number) => void;
  min?: number;
  max?: number;
};

export const NumberInput = ({
  onChange,
  value,
  min,
  max,
  className,
  ...props
}: NumberInputProps) => {
  const [rawValue, setRawValue] = useState(value?.toString() ?? "");

  const handleBlur = (value: string) => {
    const newValue = Number(value.replace(",", "."));
    const clampedValue = Math.max(
      min ?? 0,
      Math.min(max ?? Infinity, newValue || 0),
    );
    setRawValue(clampedValue.toString());
    onChange(clampedValue);
  };

  return (
    <input
      className={
        className ? className + " " + styles.numberInput : styles.numberInput
      }
      type="text"
      onBlur={(e) => {
        handleBlur(e.target.value);
      }}
      onChange={(e) => {
        setRawValue(e.target.value);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          const v =
            "value" in e.target && typeof e.target.value === "string"
              ? e.target.value
              : "";
          handleBlur(v);
        }
      }}
      value={rawValue}
      inputMode="numeric"
      min={min}
      max={max}
      {...props}
    />
  );
};
