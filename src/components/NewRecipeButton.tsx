import styled from "styled-components";
import Link from "next/link";
import { BackgroundColorTable, HoverBackgroundColorTable, RequiredButtonProps } from "./button/Button";

const LinkButton = styled(Link)<RequiredButtonProps>(props => ({
  backgroundColor: BackgroundColorTable[props.variant],
  border: "3px solid #d9b526",
  color: "inherit",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  borderRadius: "1rem",
  padding: "0.5rem 1rem",
  textDecoration: "none",
  "&:hover": {
    backgroundColor: HoverBackgroundColorTable[props.variant],
    cursor: "pointer",
  },
}));

export const NewRecipeButton = () => {
  return <LinkButton href="/recipe/new" variant="primary">New recipe</LinkButton>;
};
