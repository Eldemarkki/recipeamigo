import { Ingredient, IngredientSection, IngredientUnit } from "@prisma/client";
import { useId, useState } from "react";
import styled from "styled-components";
import { capitalizeFirstLetter } from "../../utils/stringUtils";
import { NumberInput } from "../forms/NumberInput";
import { Button } from "../button/Button";

export type RawIngredient = Omit<Ingredient, "id" | "ingredientSectionId" | "order">;

export type RawIngredientSection = Omit<IngredientSection, "id" | "recipeId" | "order"> & {
  ingredients: RawIngredient[];
}

export type IngredientFormProps = {
  type: "new" | "edit",
  addIngredient: (ingredient: RawIngredient) => void;
  onCancel?: () => void;
  initialIngredient?: Partial<RawIngredient>;
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

const AmountRow = styled.div({
  display: "flex",
  flexDirection: "row",
  gap: "0.5rem",
  alignItems: "end",
});

const IngredientAmountInputContainer = styled.div({
  display: "flex",
  flex: 1
});

const InputsContainer = styled.div({
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem",
});

const OptionalContainer = styled.div({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  gap: "0.2rem",
});

const OptionalCheckbox = styled.input({
  margin: 0,
});

export const IngredientForm = ({
  type,
  addIngredient,
  initialIngredient,
  onCancel
}: IngredientFormProps) => {
  const [ingredientName, setIngredientName] = useState(initialIngredient?.name ?? "");
  const [ingredientAmount, setIngredientAmount] = useState(initialIngredient?.quantity ?? 0);
  const [ingredientUnit, setIngredientUnit] = useState<IngredientUnit | null>(initialIngredient?.unit ?? null);
  const [ingredientOptional, setIngredientOptional] = useState(initialIngredient?.isOptional ?? false);

  const ingredientNameId = useId();
  const ingredientAmountId = useId();
  const ingredientUnitId = useId();
  const ingredientOptionalId = useId();

  return <Container>
    {type === "new" && <Title>New ingredient</Title>}
    <Form onSubmit={(e) => {
      e.preventDefault();
      addIngredient({
        name: ingredientName,
        quantity: ingredientAmount,
        unit: ingredientUnit,
        isOptional: ingredientOptional,
      });
      setIngredientName("");
      setIngredientAmount(0);
      setIngredientUnit(null);
    }}>
      <InputsContainer>
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
        <AmountRow>
          <InputContainer style={{ flex: 1 }}>
            <InputLabel htmlFor={ingredientAmountId}>Amount</InputLabel>
            <IngredientAmountInputContainer>
              <NumberInput
                id={ingredientAmountId}
                min={0}
                required
                value={ingredientAmount}
                onChange={setIngredientAmount}
                key={ingredientAmount}
                style={{ flex: 1 }}
              />
            </IngredientAmountInputContainer>
          </InputContainer>
          <InputContainer>
            <InputLabel htmlFor={ingredientUnitId}>Unit</InputLabel>
            <select
              id={ingredientUnitId}
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
        </AmountRow>
        <OptionalContainer>
          <OptionalCheckbox
            id={ingredientOptionalId}
            type="checkbox"
            checked={ingredientOptional}
            onChange={(e) => setIngredientOptional(e.target.checked)}
          />
          <InputLabel htmlFor={ingredientOptionalId}>Optional</InputLabel>
        </OptionalContainer>
      </InputsContainer>
      <ButtonsContainer>
        {onCancel && <Button style={{ flex: 1 }} type="button" onClick={onCancel} variant="secondary">
          Cancel
        </Button>}
        <Button style={{ flex: 1 }} type="submit">
          {type === "new" ? "Add ingredient" : "Save"}
        </Button>
      </ButtonsContainer>
    </Form>
  </Container>;
};
