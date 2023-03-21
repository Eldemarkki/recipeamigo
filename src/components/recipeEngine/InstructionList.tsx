import { useState } from "react";
import styled from "styled-components";

export type InstructionListProps = {
  instructions: string[];
  addInstruction: (instruction: string) => void;
  removeInstruction: (index: number) => void;
}

const Container = styled.ol({
  display: "flex",
  flexDirection: "column",
});

const InstructionListItem = styled.div({
  display: "flex",
  gap: "0.3rem",
});

const Form = styled.form({
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
});

const AddButton = styled.button({
  backgroundColor: "#f2c61d",
  border: "3px solid #d9b526",
  borderRadius: "1rem",
  padding: "0.2rem 0.5rem",
  textDecoration: "none",
  color: "inherit",
});

export const InstructionList = ({ instructions, addInstruction, removeInstruction }: InstructionListProps) => {
  const [newInstruction, setNewInstruction] = useState("");

  return <div>
    <Container>
      {instructions.map((instruction, index) => (
        <li key={instruction}>
          <InstructionListItem>
            {instruction}
            <button onClick={() => removeInstruction(index)}>-</button>
          </InstructionListItem>
        </li>
      ))}
    </Container>
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
      <AddButton type="submit">Add instruction</AddButton>
    </Form>
  </div>;
};
