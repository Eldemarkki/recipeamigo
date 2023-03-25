import { DetailedHTMLProps, InputHTMLAttributes, useState } from "react";

export type NumberInputProps = Omit<DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>, "onChange" | "onBlur" | "type"> & {
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

export const NumberInput = ({ onChange, value, min, max, ...props }: NumberInputProps) => {
  const [rawValue, setRawValue] = useState(value?.toString() ?? "");

  return <input
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
