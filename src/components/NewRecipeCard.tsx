import { PlusIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import styled from "styled-components";

const Container = styled(Link)({
  display: "flex",
  flexDirection: "row",
  justifyContent: "center",
  alignItems: "center",
  border: "2px dashed black",
  padding: "0.5rem 0.3rem",
  borderRadius: "0.5rem",
  gap: "0.5rem",
  fontSize: "1.2rem",
  textDecoration: "none",
  color: "inherit",
  "&:hover": {
    backgroundColor: "rgba(0, 0, 0, 0.03)",
  },
  minHeight: "6rem",
});

export const NewRecipeCard = () => {
  return <Container href="/recipe/new">
    <PlusIcon width={24} height={24} />
    Create new recipe
  </Container>;
};
