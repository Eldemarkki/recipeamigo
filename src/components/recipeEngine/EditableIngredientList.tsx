import styled from "styled-components";
import { RawIngredient, RawIngredientSection } from "./IngredientForm";
import { PlusIcon } from "@radix-ui/react-icons";
import { useState } from "react";
import { IngredientSectionForm } from "./IngredientSectionForm";
import { Reorder } from "framer-motion";
import { EditableIngredientSection } from "./EditableIngredientSection";

export type IngredientListProps = {
  ingredientSections: RawIngredientSection[];
  addIngredient: (ingredient: RawIngredient, ingredientSectionName: string) => void;
  removeIngredient: (index: number, ingredientSectionName: string) => void;
  addIngredientSection: (ingredientSectionName: string) => void;
  removeIngredientSection: (index: number) => void;
  setIngredientSectionIngredients: (index: number, items: RawIngredient[]) => void;
  setIngredientSections: (items: RawIngredientSection[]) => void;
}

const Container = styled.div({
  display: "flex",
  flexDirection: "column",
  gap: "1rem"
});

const IngredientSections = styled(Reorder.Group)({
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem",
  padding: 0,
  margin: 0,
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

export const EditableIngredientList = ({
  ingredientSections,
  addIngredient,
  removeIngredient,
  addIngredientSection,
  removeIngredientSection,
  setIngredientSectionIngredients,
  setIngredientSections
}: IngredientListProps) => {
  const [newItemType, setNewItemType] = useState<
    | { type: "ingredient", ingredientSectionName: string }
    | { type: "section" }
    | null
  >(null);

  return <Container>
    {ingredientSections.length > 0 && <IngredientSections
      onReorder={setIngredientSections}
      values={ingredientSections}
      axis="y"
    >
      {ingredientSections.map((ingredientSection, ingredientSectionIndex) =>
        <EditableIngredientSection
          key={ingredientSection.name}
          ingredientSection={ingredientSection}
          onRemove={() => removeIngredientSection(ingredientSectionIndex)}
          setIngredients={ingredients => setIngredientSectionIngredients(ingredientSectionIndex, ingredients)}
          onRemoveIngredient={ingredientIndex => removeIngredient(ingredientIndex, ingredientSection.name)}
          addIngredient={ingredient => addIngredient(ingredient, ingredientSection.name)}
          newItemType={newItemType}
          setNewItemType={setNewItemType}
        />
      )}
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
