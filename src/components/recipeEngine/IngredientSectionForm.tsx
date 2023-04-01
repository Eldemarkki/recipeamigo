import { useState } from "react";
import styled from "styled-components";

const ButtonsContainer = styled.div({
  display: "flex",
  flexDirection: "row",
  gap: "1rem",
});

const Button = styled.button({
  backgroundColor: "#f2c61d",
  border: "3px solid #d9b526",
  borderRadius: "1rem",
  padding: "0.2rem 0.5rem",
  textDecoration: "none",
  color: "inherit",
  flex: 1
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
        <Button type="button" onClick={props.onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          Create
        </Button>
      </ButtonsContainer>
    </Form>
  </Container>;
};
