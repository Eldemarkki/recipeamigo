import styled from "styled-components";
import { CrossOffText } from "./CrossOffText";

const List = styled.ol({
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem",
  padding: 0,
  listStyle: "none",
});

const ListItem = styled.li({
  backgroundColor: "#f1f1f1",
  padding: "0.3rem 0.6rem",
});


export type InstructionsListProps = {
  instructions: string[];
}

export const InstructionsList = (props: InstructionsListProps) => {
  return <List>
    {props.instructions.map(instruction => <ListItem key={instruction}>
      <CrossOffText>{instruction}</CrossOffText>
    </ListItem>)}
  </List>;
};
