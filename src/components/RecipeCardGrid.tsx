import { Recipe } from "@prisma/client";
import { ConvertDates } from "../utils/types";
import styled from "styled-components";
import { RecipeCard } from "./RecipeCard";
import { NewRecipeCard } from "./NewRecipeCard";

export type RecipeCardGridProps = {
  showCreateButton?: boolean | undefined | null;
  recipes: ConvertDates<Recipe>[];
};

const Grid = styled.div({
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
  gridGap: "1rem",
});

export const RecipeCardGrid = (props: RecipeCardGridProps) => {
  return <Grid>
    {props.showCreateButton && <NewRecipeCard />}
    {props.recipes.map(recipe => <RecipeCard
      key={recipe.id}
      id={recipe.id}
      name={recipe.name}
      description={recipe.description}
    />)}
  </Grid>;
};
