import styled from "styled-components";
import { NumberInput } from "../forms/NumberInput";
import { CircularButton } from "../button/Button";
import { MinusIcon, PlusIcon } from "@radix-ui/react-icons";

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

export type RecipeQuantityPickerProps = {
  quantity: number;
  onChange: (quantity: number) => void;
};

export const RecipeQuantityPicker = ({ quantity, onChange }: RecipeQuantityPickerProps) => {
  return <Container>
    <span>Recipe quantity</span>
    <InputContainer>
      <CircularButton type="button" onClick={() => onChange(Math.max(quantity - 1, 1))} aria-label="Decrease">
        <MinusIcon />
      </CircularButton>
      <NumberInputStyled value={quantity} onChange={onChange} key={quantity} min={1} />
      <CircularButton type="button" onClick={() => onChange(quantity + 1)} aria-label="Increase">
        <PlusIcon />
      </CircularButton>
    </InputContainer>
  </Container>;
};
