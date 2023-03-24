import styled from "styled-components";

const Container = styled.div({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
});

const InputContainer = styled.div({
  display: "flex",
  gap: "0.5rem",
  alignItems: "center",
});

export type RecipeQuantityPickerProps = {
  quantity: number;
  onChange: (quantity: number) => void;
};

export const RecipeQuantityPicker = ({ quantity, onChange }: RecipeQuantityPickerProps) => {
  return <Container>
    <span>Recipe quantity</span>
    <InputContainer>
      <button onClick={() => onChange(Math.max(quantity - 1, 1))}>-</button>
      <span>{quantity}</span>
      <button onClick={() => onChange(quantity + 1)}>+</button>
    </InputContainer>
  </Container>;
};
