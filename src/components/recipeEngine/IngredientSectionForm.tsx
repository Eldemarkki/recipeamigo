import { useState } from "react";
import styled from "styled-components";
import { Button } from "../button/Button";

const ButtonsContainer = styled.div({
  display: "flex",
  flexDirection: "row",
  gap: "1rem",
});

const Title = styled.h3({
  margin: 0,
  padding: 0,
});

const Form = styled.form({
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
});

const Container = styled.div({
  gap: "0.5rem",
  display: "flex",
  flexDirection: "column",
  border: "1px solid #bbb",
  padding: "0.5rem",
  borderRadius: "0.6rem",
});

export type IngredientSectionFormProps = {
  addIngredientSection: (ingredientSectionName: string) => void;
  onCancel: () => void;
};

export const IngredientSectionForm = (props: IngredientSectionFormProps) => {
  const [sectionName, setSectionName] = useState("");

  return <Container>
    <Title>New section</Title>
    <Form onSubmit={(e) => {
      e.preventDefault();
      props.addIngredientSection(sectionName);
    }}>
      <input
        type="text"
        value={sectionName}
        onChange={(e) => setSectionName(e.target.value)}
        placeholder="Section name"
        required
      />
      <ButtonsContainer>
        <Button style={{ flex: 1 }} type="button" onClick={props.onCancel} variant="secondary">
          Cancel
        </Button>
        <Button style={{ flex: 1 }} type="submit">
          Create
        </Button>
      </ButtonsContainer>
    </Form>
  </Container>;
};
