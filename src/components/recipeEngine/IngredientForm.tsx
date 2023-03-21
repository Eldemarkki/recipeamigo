import { Ingredient, IngredientUnit } from "@prisma/client";
import { useId, useState } from "react";
import styled from "styled-components";
import { capitalizeFirstLetter } from "../../utils/stringUtils";

export type RawIngredient = Omit<Ingredient, "id" | "recipeId">;

export type IngredientFormProps = {
  addIngredient: (ingredient: RawIngredient) => void;
}

const units = Object.keys(IngredientUnit) as IngredientUnit[];

const AddButton = styled.button({
  backgroundColor: "#f2c61d",
  border: "3px solid #d9b526",
  borderRadius: "1rem",
  padding: "0.2rem 0.5rem",
  textDecoration: "none",
  color: "inherit",
});

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

export const IngredientForm = ({ addIngredient }: IngredientFormProps) => {
  const [ingredientName, setIngredientName] = useState("");

  const [ingredientAmountRaw, setIngredientAmountRaw] = useState("");
  const [ingredientAmount, setIngredientAmount] = useState(0);

  const [ingredientUnit, setIngredientUnit] = useState<IngredientUnit | null>(null);

  const ingredientNameId = useId();
  const ingredientAmountId = useId();

  return <Form onSubmit={(e) => {
    e.preventDefault();
    addIngredient({
      name: ingredientName,
      quantity: ingredientAmount,
      unit: ingredientUnit,
    });
    setIngredientName("");
    setIngredientAmount(0);
    setIngredientAmountRaw("");
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
      <input
        id={ingredientAmountId}
        value={ingredientAmountRaw}
        onChange={(event) => {
          setIngredientAmountRaw(event.target.value);
        }}
        onBlur={(event) => {
          const val = event.target.value;
          if (val === "") {
            setIngredientAmountRaw("");
            return setIngredientAmount(0);
          }
          const num = Number(val.replace(",", "."));
          if (isNaN(num)) {
            setIngredientAmountRaw("0");
            return;
          }
          setIngredientAmountRaw(num.toString());
          return setIngredientAmount(num);
        }}
        type="text"
        min={0}
        required
      />
    </InputContainer>
    <InputContainer>
      <select
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
    <AddButton type="submit">
      Add ingredient
    </AddButton>
  </Form>;
};
