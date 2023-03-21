import Link from "next/link";
import styled from "styled-components";

const Button = styled(Link)({
  backgroundColor: "#f2c61d",
  border: "3px solid #d9b526",
  borderRadius: "1rem",
  padding: "0.5rem 1rem",
  textDecoration: "none",
  color: "inherit"
});

export const NewRecipeButton = () => {
  return <Button href="/recipe/new">New recipe</Button>;
};
