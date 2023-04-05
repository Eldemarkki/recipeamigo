import styled from "styled-components";
import { RawIngredient, RawIngredientSection } from "./IngredientForm";
import { PlusIcon } from "@radix-ui/react-icons";
import { useState } from "react";
import { IngredientSectionForm } from "./IngredientSectionForm";
import { Reorder } from "framer-motion";
import { EditableIngredientSection } from "./EditableIngredientSection";
import { CircularButton } from "../button/Button";

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
          onEditIngredient={(newIngredient, index) => {
            setIngredientSectionIngredients(ingredientSectionIndex, ingredientSection.ingredients.map((ingredient, i) => {
              if (i === index) {
                return newIngredient;
              }
              return ingredient;
            }));
          }}
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
        <CircularButton
          onClick={() => setNewItemType({ type: "section" })}
        >
          <PlusIcon />
        </CircularButton>
      </IngredientSectionBottomSection>
    }
  </Container >;
};
