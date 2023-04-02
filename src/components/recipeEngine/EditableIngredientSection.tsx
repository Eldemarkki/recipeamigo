import { PlusIcon, TrashIcon } from "@radix-ui/react-icons";
import styled from "styled-components";
import { IngredientForm, RawIngredient, RawIngredientSection } from "./IngredientForm";
import { Reorder } from "framer-motion";
import { EditableIngredientListItem } from "./EditableIngredientListItem";

const DeleteButton = styled.button({
  backgroundColor: "transparent",
  display: "flex",
  justifyContent: "center",
  aspectRatio: "1",
  borderRadius: "15%",
  alignItems: "center",
  border: "none",
  margin: 0,
  "&:hover, &:focus": {
    cursor: "pointer",
    backgroundColor: "#ea2727",
    color: "white",
  },
});

const Container = styled.div({
  display: "flex",
  flexDirection: "column",
  border: "1px solid #bbb",
  padding: "0.5rem",
  gap: "0.7rem",
  borderRadius: "0.6rem",
});

const Title = styled.h3({
  margin: 0,
  padding: 0,
});

const TopRow = styled.div({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
});

const IngredientList = styled(Reorder.Group)({
  display: "flex",
  flexDirection: "column",
  gap: "0.2rem",
  margin: 0,
  padding: 0,
});

const IngredientSectionBottomSection = styled.div({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
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

export type EditableIngredientSectionProps = {
  ingredientSection: RawIngredientSection;
  onRemove: () => void;
  setIngredients: (ingredients: RawIngredient[]) => void;
  onRemoveIngredient: (ingredientIndex: number) => void;
  newItemType:
  | { type: "ingredient", ingredientSectionName: string }
  | { type: "section" }
  | null,
  setNewItemType: (newItemType: EditableIngredientSectionProps["newItemType"]) => void,
  addIngredient: (ingredient: RawIngredient) => void,
};

export const EditableIngredientSection = ({
  ingredientSection,
  onRemove,
  setIngredients,
  onRemoveIngredient,
  newItemType,
  setNewItemType,
  addIngredient
}: EditableIngredientSectionProps) => {
  return <Container>
    <TopRow>
      <Title>{ingredientSection.name}</Title>
      <DeleteButton onClick={() => {
        // TODO: Implement a more beautiful confirmation dialog
        if (confirm(`Are you sure you want to delete the ingredient section "${ingredientSection.name}"?`)) {
          onRemove();
        }
      }}>
        <TrashIcon />
      </DeleteButton>
    </TopRow>
    <IngredientList
      axis="y"
      values={ingredientSection.ingredients}
      onReorder={(items) => {
        setIngredients(items as RawIngredient[]);
      }}
    >
      {ingredientSection.ingredients.map((ingredient, index) => (
        <EditableIngredientListItem
          key={ingredient.name}
          ingredient={ingredient}
          onRemove={() => onRemoveIngredient(index)}
        />
      ))}
    </IngredientList>
    {newItemType && newItemType.type === "ingredient" && newItemType.ingredientSectionName === ingredientSection.name
      ? <IngredientForm
        addIngredient={addIngredient}
        onCancel={() => setNewItemType(null)} />
      : <IngredientSectionBottomSection>
        <AddIngredientButton onClick={() => setNewItemType({ type: "ingredient", ingredientSectionName: ingredientSection.name })}>
          <PlusIcon />
        </AddIngredientButton>
      </IngredientSectionBottomSection>}
  </Container>;
};
