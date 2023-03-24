import styled from "styled-components";
import { IngredientForm, RawIngredient } from "./IngredientForm";

export type IngredientListProps = {
  ingredients: RawIngredient[];
  addIngredient: (ingredient: RawIngredient) => void;
  removeIngredient: (index: number) => void;
}

const Container = styled.div({
  display: "flex",
  flexDirection: "column",
  gap: "1rem"
});

const IngredientListContainer = styled.div({
  display: "flex",
  flexDirection: "column",
  listStyle: "none",
  gap: "0.1rem"
});

const IngredientListItem = styled.li({
  display: "flex",
  gap: "0.3rem"
});

export const EditableIngredientList = ({ ingredients, addIngredient, removeIngredient }: IngredientListProps) => {
  return <Container>
    {ingredients.length > 0 && <IngredientListContainer>
      {ingredients.map((ingredient, index) => (
        <IngredientListItem key={index}>
          <button onClick={() => removeIngredient(index)}>-</button>
          <span>
            {ingredient.quantity}{ingredient.unit?.toLowerCase() || ""} {ingredient.name}
          </span>
        </IngredientListItem>
      ))}
    </IngredientListContainer>}
    <div>
      <h3>New ingredient</h3>
      <IngredientForm addIngredient={addIngredient} />
    </div>
  </Container>;
};