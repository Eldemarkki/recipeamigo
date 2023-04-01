import styled from "styled-components";
import { IngredientForm, RawIngredient, RawIngredientSection } from "./IngredientForm";
import { PlusIcon } from "@radix-ui/react-icons";
import { useState } from "react";
import { IngredientSectionForm } from "./IngredientSectionForm";

export type IngredientListProps = {
  ingredientSections: RawIngredientSection[];
  addIngredient: (ingredient: RawIngredient, ingredientSectionName: string) => void;
  removeIngredient: (index: number, ingredientSectionName: string) => void;
  addIngredientSection: (ingredientSectionName: string) => void;
  removeIngredientSection: (index: number) => void;
}

const Container = styled.div({
  display: "flex",
  flexDirection: "column",
  gap: "1rem"
});

const IngredientSections = styled.div({ // TODO: Make this <ul>
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem"
});

const IngredientListItem = styled.li({
  display: "flex",
  gap: "0.3rem"
});

const IngredientSectionContainer = styled.div({
  display: "flex",
  flexDirection: "column",
  border: "1px solid #bbb",
  padding: "0.5rem",
  gap: "0.7rem",
  borderRadius: "0.6rem",
});

const IngredientList = styled.ul({
  display: "flex",
  flexDirection: "column",
  gap: "0.2rem",
  margin: 0,
  padding: 0,
});

const AddIngredientButton = styled.button({
  backgroundColor: "#f2c61d",
  border: "3px solid #d9b526",
  borderRadius: "50%",
  textDecoration: "none",
  color: "inherit",
  aspectRatio: "1",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  "&:hover": {
    backgroundColor: "#e5bb1b",
    cursor: "pointer",
  },
});

const IngredientSectionBottomSection = styled.div({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
});

const IngredientSectionTitle = styled.h3({
  margin: 0,
  padding: 0,
});

export const EditableIngredientList = ({
  ingredientSections,
  addIngredient,
  removeIngredient,
  addIngredientSection,
  removeIngredientSection,
}: IngredientListProps) => {
  const [newItemType, setNewItemType] = useState<
    | { type: "ingredient", ingredientSectionName: string }
    | { type: "section" }
    | null
  >(null);

  return <Container>
    {ingredientSections.length > 0 && <IngredientSections>
      {ingredientSections.map((ingredientSection) => <IngredientSectionContainer key={ingredientSection.name}>
        <IngredientSectionTitle>{ingredientSection.name}</IngredientSectionTitle>
        <IngredientList>
          {ingredientSection.ingredients.map((ingredient, index) => (
            <IngredientListItem key={ingredient.name}>
              <button onClick={() => removeIngredient(index, ingredientSection.name)}>Remove</button>
              <span>
                {ingredient.quantity}{ingredient.unit?.toLowerCase() || ""} {ingredient.name}
              </span>
            </IngredientListItem>))}
        </IngredientList>
        {newItemType && newItemType.type === "ingredient" && newItemType.ingredientSectionName === ingredientSection.name
          ? <IngredientForm
            addIngredient={(i) => addIngredient(i, ingredientSection.name)}
            onCancel={() => setNewItemType(null)} />
          : <IngredientSectionBottomSection>
            <AddIngredientButton onClick={() => setNewItemType({ type: "ingredient", ingredientSectionName: ingredientSection.name })}>
              <PlusIcon />
            </AddIngredientButton>
          </IngredientSectionBottomSection>}
      </IngredientSectionContainer>)}
    </IngredientSections>}
    {(newItemType && newItemType.type === "section")
      ? <IngredientSectionForm
        addIngredientSection={ingredientSectionName => {
          addIngredientSection(ingredientSectionName);
          setNewItemType({ type: "ingredient", ingredientSectionName });
        }}
        onCancel={() => setNewItemType(null)}
      />
      : <IngredientSectionBottomSection>
        <AddIngredientButton onClick={() => setNewItemType({ type: "section" })}>
          <PlusIcon />
        </AddIngredientButton>
      </IngredientSectionBottomSection>
    }
  </Container >;
};
