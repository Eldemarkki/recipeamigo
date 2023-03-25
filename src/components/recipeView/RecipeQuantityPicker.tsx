import styled from "styled-components";
import { NumberInput } from "../forms/NumberInput";

const Container = styled.div({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  flexDirection: "row",
  gap: "1rem"
});

const InputContainer = styled.div({
  display: "flex",
  gap: "0.5rem",
  alignItems: "center",
});

const NumberInputStyled = styled(NumberInput)({
  width: "2.5rem",
  border: "none",
  textAlign: "center",
});

const ControlButton = styled.button({
  borderRadius: "50%",
  width: "1.5rem",
  height: "1.5rem",
  border: "1.5px solid black",
  backgroundColor: "#00000000",
  "&:hover": {
    backgroundColor: "#00000022",
  },
});

export type RecipeQuantityPickerProps = {
  quantity: number;
  onChange: (quantity: number) => void;
};

export const RecipeQuantityPicker = ({ quantity, onChange }: RecipeQuantityPickerProps) => {
  return <Container>
    <span>Recipe quantity</span>
    <InputContainer>
      <ControlButton type="button" onClick={() => onChange(Math.max(quantity - 1, 1))} aria-label="Decrease">-</ControlButton>
      <NumberInputStyled value={quantity} onChange={onChange} key={quantity} />
      <ControlButton type="button" onClick={() => onChange(quantity + 1)} aria-label="Increase">+</ControlButton>
    </InputContainer>
  </Container>;
};
