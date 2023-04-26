import { ComponentProps, useState } from "react";
import styles from "./NumberInput.module.css";

export type NumberInputProps = Omit<ComponentProps<"input">, "onChange" | "onBlur" | "type"> & {
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

export const NumberInput = ({ onChange, value, min, max, className, ...props }: NumberInputProps) => {
  const [rawValue, setRawValue] = useState(value?.toString() ?? "");

  return <input
    className={className ? className + " " + styles.numberInput : styles.numberInput}
    type="text"
    onBlur={e => {
      const newValue = Number(e.target.value.replace(",", "."));
      const clampedValue = Math.max(min ?? 0, Math.min(max ?? Infinity, newValue || 0));
      setRawValue(clampedValue.toString());
      onChange(clampedValue);
    }}
    onChange={e => {
      setRawValue(e.target.value);
    }}
    value={rawValue}
    inputMode="numeric"
    min={min}
    max={max}
    {...props}
  />;
};
