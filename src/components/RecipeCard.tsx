import Image from "next/image";
import Link from "next/link";
import styled from "styled-components";
import PlaceholderImage from "../images/recipe_placeholder.jpg";

export type RecipeCardProps = {
  id: string;
  name: string;
  description: string;
}

const Container = styled.div({
  display: "flex",
  flexDirection: "column",
  border: "1px solid black",
  borderRadius: "0.5rem",
  gap: "1rem",
  minHeight: "16rem",
});

const RecipeName = styled.h3({
  margin: 0,
});

const RecipeDescription = styled.p({
  margin: 0,
});

const RecipeInfoContainer = styled.div({
  padding: "0 1rem",
});

export const RecipeCard = (props: RecipeCardProps) => {
  return <Container>
    <div style={{
      position: "relative",
      width: "100%",
      height: "10rem",
      overflow: "hidden",
      borderRadius: "0.5rem 0.5rem 0 0",
    }}>
      <Image
        src={PlaceholderImage}
        alt="Recipe placeholder image"
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        style={{
          objectFit: "cover",
          objectPosition: "center",
        }}
      />
    </div>
    <RecipeInfoContainer>
      <Link href={`/recipe/${props.id}`}>
        <RecipeName>
          {props.name}
        </RecipeName>
      </Link>
      <RecipeDescription>{props.description}</RecipeDescription>
    </RecipeInfoContainer>
  </Container>;
};
