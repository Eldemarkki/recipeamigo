import { useState } from "react";
import styled from "styled-components";

const Label = styled.label<{ isChecked: boolean }>(props => ({
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  textDecoration: props.isChecked ? "line-through" : "none",
}));

export type CrossOffText = React.PropsWithChildren<{}>;

export const CrossOffText = ({ children }: CrossOffText) => {
  const [checked, setChecked] = useState(false);

  return <Label isChecked={checked}>
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => setChecked(e.target.checked)}
    />
    {children}
  </Label>;
};
