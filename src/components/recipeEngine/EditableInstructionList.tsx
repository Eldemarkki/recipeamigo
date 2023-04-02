import { useState } from "react";
import styled from "styled-components";
import { DeleteButton } from "../button/DeleteButton";
import { Button } from "../button/Button";

export type InstructionListProps = {
  instructions: string[];
  addInstruction: (instruction: string) => void;
  removeInstruction: (index: number) => void;
}

const Container = styled.div({
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
  maxWidth: 500
});

const ListContainer = styled.ol({
  margin: 0,
  display: "flex",
  flexDirection: "column",
});

const InstructionListItem = styled.div({
  display: "flex",
  gap: "0.3rem",
  justifyContent: "space-between",
});

const Form = styled.form({
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
});

export const EditableInstructionList = ({ instructions, addInstruction, removeInstruction }: InstructionListProps) => {
  const [newInstruction, setNewInstruction] = useState("");

  return <Container>
    <ListContainer>
      {instructions.map((instruction, index) => (
        <li key={instruction}>
          <InstructionListItem>
            {instruction}
            <DeleteButton onClick={() => removeInstruction(index)} />
          </InstructionListItem>
        </li>
      ))}
    </ListContainer>
    <Form onSubmit={(e) => {
      e.preventDefault();
      addInstruction(newInstruction);
      setNewInstruction("");
    }}>
      <input
        type="text"
        value={newInstruction}
        onChange={(e) => setNewInstruction(e.target.value)}
        placeholder="New instruction"
        required
      />
      <Button type="submit">Add instruction</Button>
    </Form>
  </Container>;
};
