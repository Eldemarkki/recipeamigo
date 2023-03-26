import { Ingredient, IngredientSection as IngredientSectionType } from "@prisma/client";
import { IngredientList } from "./IngredientList";
import styled from "styled-components";

export type IngredientSectionProps = {
  section: IngredientSectionType & {
    ingredients: Ingredient[];
  };
  recipeQuantity: number;
  originalRecipeQuantity: number;
};

const Container = styled.div({
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem",
});

const Title = styled.h3({
  margin: 0,
});

export const IngredientSection = ({ section, recipeQuantity, originalRecipeQuantity }: IngredientSectionProps) => {
  return <Container>
    <Title>{section.name}</Title>
    <IngredientList
      ingredients={section.ingredients}
      recipeQuantity={recipeQuantity}
      originalRecipeQuantity={originalRecipeQuantity}
    />
  </Container>;
};
