import { useState } from "react";
import styled from "styled-components";

const Label = styled.label<{ isChecked: boolean }>(props => ({
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  textDecoration: props.isChecked ? "line-through" : "none",
}));

export type IngredientListItemProps = React.PropsWithChildren<{}>;

export const IngredientListItem = ({ children }: IngredientListItemProps) => {
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
