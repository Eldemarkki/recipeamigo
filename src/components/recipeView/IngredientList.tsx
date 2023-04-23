import { Ingredient } from "@prisma/client";
import styled from "styled-components";
import { CrossOffText } from "./CrossOffText";
import { IngredientText } from "../IngredientText";

const List = styled.ul({
  display: "flex",
  flexDirection: "column",
  listStyle: "none",
  padding: 0,
  margin: 0,
  gap: "0.5rem",
});

const ListItem = styled.li({
  backgroundColor: "#f1f1f1",
  padding: "0.3rem 0.6rem",
});

export type IngredientListProps = {
  ingredients: Ingredient[];
  originalRecipeQuantity: number;
  recipeQuantity: number;
};

export const IngredientList = ({
  ingredients,
  originalRecipeQuantity,
  recipeQuantity,
}: IngredientListProps) => {
  return <List>
    {ingredients.map((ingredient) => (
      <ListItem key={ingredient.id}>
        <CrossOffText>
          <IngredientText
            ingredient={ingredient}
            originalRecipeQuantity={originalRecipeQuantity}
            recipeQuantity={recipeQuantity}
          />
        </CrossOffText>
      </ListItem>
    ))}
  </List>;
};
