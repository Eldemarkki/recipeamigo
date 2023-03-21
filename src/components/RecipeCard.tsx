import Link from "next/link";
import styled from "styled-components";

export type RecipeCardProps = {
  id: string;
  name: string;
  description: string;
}

const Container = styled.div({
  display: "flex",
  flexDirection: "column",
  border: "1px solid black",
  padding: "0.5rem 0.3rem",
  borderRadius: "0.5rem",
  gap: "1rem"
});

const RecipeName = styled.h3({
  margin: 0,
});

const RecipeDescription = styled.p({
  margin: 0,
});

export const RecipeCard = (props: RecipeCardProps) => {
  return <Container>
    <Link href={`/recipe/${props.id}`}>
      <RecipeName>
        {props.name}
      </RecipeName>
    </Link>
    <RecipeDescription>{props.description}</RecipeDescription>
  </Container>;
};
