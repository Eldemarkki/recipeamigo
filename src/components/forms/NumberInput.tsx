import { DetailedHTMLProps, InputHTMLAttributes, useState } from "react";

export type NumberInputProps = Omit<DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>, "onChange" | "onBlur" | "type"> & {
  onChange: (value: number) => void;
  initialValue?: number;
}

export const NumberInput = ({ onChange, initialValue, ...props }: NumberInputProps) => {
  const [valueRaw, setValueRaw] = useState(initialValue?.toString() ?? "");

  return <input
    value={valueRaw}
    type="text" // TODO: Make this a number input, this is terrible. It's a quick fix to make onChange be always called, even when the value is invalid.
    onChange={(event) => {
      setValueRaw(event.target.value);
      console.log(event.target.value);
    }}
    onBlur={(event) => {
      const val = event.target.value;
      if (val === "") {
        setValueRaw("");
        return onChange(0);
      }
      const num = Number(val.replace(",", "."));
      if (isNaN(num)) {
        setValueRaw("0");
        return;
      }
      setValueRaw(num.toString());
      onChange(num);
    }}
    {...props}
  />;
};
