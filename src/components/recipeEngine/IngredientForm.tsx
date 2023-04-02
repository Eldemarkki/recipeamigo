import { Ingredient, IngredientSection, IngredientUnit } from "@prisma/client";
import { useId, useState } from "react";
import styled from "styled-components";
import { capitalizeFirstLetter } from "../../utils/stringUtils";
import { NumberInput } from "../forms/NumberInput";
import { Button } from "../button/Button";

export type RawIngredient = Omit<Ingredient, "id" | "ingredientSectionId">;

export type RawIngredientSection = Omit<IngredientSection, "id" | "recipeId"> & {
  ingredients: RawIngredient[];
}

export type IngredientFormProps = {
  addIngredient: (ingredient: RawIngredient) => void;
  onCancel: () => void;
}

const units = Object.keys(IngredientUnit) as IngredientUnit[];

const Form = styled.form({
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
});

const InputContainer = styled.div({
  display: "flex",
  flexDirection: "column",
});

const InputLabel = styled.label({
  fontSize: "0.8rem",
});

const ButtonsContainer = styled.div({
  display: "flex",
  flex: 1,
  flexDirection: "row",
  gap: "1rem",
});

const Title = styled.h4({
  margin: 0,
  padding: 0,
});

const Container = styled.div({
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem",
});

export const IngredientForm = ({ addIngredient, onCancel }: IngredientFormProps) => {
  const [ingredientName, setIngredientName] = useState("");
  const [ingredientAmount, setIngredientAmount] = useState(0);
  const [ingredientUnit, setIngredientUnit] = useState<IngredientUnit | null>(null);

  const ingredientNameId = useId();
  const ingredientAmountId = useId();

  return <Container>
    <Title>New ingredient</Title>
    <Form onSubmit={(e) => {
      e.preventDefault();
      addIngredient({
        name: ingredientName,
        quantity: ingredientAmount,
        unit: ingredientUnit,
      });
      setIngredientName("");
      setIngredientAmount(0);
      setIngredientUnit(null);
    }}>
      <InputContainer>
        <InputLabel htmlFor={ingredientNameId}>Ingredient name</InputLabel>
        <input
          id={ingredientNameId}
          value={ingredientName}
          onChange={(event) => setIngredientName(event.target.value)}
          type="text"
          required
        />
      </InputContainer>
      <InputContainer>
        <InputLabel htmlFor={ingredientAmountId}>Amount</InputLabel>
        <NumberInput
          id={ingredientAmountId}
          min={0}
          required
          value={ingredientAmount}
          onChange={setIngredientAmount}
          key={ingredientAmount}
        />
      </InputContainer>
      <InputContainer>
        <select
          value={ingredientUnit || ""}
          onChange={(e) => {
            const value = e.target.value as IngredientUnit | "";
            setIngredientUnit(value || null);
          }}
          aria-label="Unit"
        >
          <option value="">No unit</option>
          {units.map((unit) => <option key={unit} value={unit}>{capitalizeFirstLetter(unit)}</option>)}
        </select>
      </InputContainer>
      <ButtonsContainer>
        <Button style={{ flex: 1 }} type="button" onClick={onCancel} variant="secondary">
          Cancel
        </Button>
        <Button style={{ flex: 1 }} type="submit">
          Add ingredient
        </Button>
      </ButtonsContainer>
    </Form>
  </Container>;
};
