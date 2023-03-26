import { useState } from "react";
import { EditableIngredientList } from "../../../components/recipeEngine/EditableIngredientList";
import { RawIngredientSection } from "../../../components/recipeEngine/IngredientForm";
import { EditableInstructionList } from "../../../components/recipeEngine/EditableInstructionList";
import styled from "styled-components";
import { z } from "zod";
import { createRecipeSchema } from "../../api/recipes";
import { useRouter } from "next/router";
import { RecipeQuantityPicker } from "../../../components/recipeView/RecipeQuantityPicker";
import { createRecipe } from "../../../database/recipes";

const Container = styled.div({
  display: "flex",
  flexDirection: "column",
  padding: "5rem",
  gap: "2rem",
});

const SplitContainer = styled.main({
  display: "flex",
  gap: "10rem"
});

const LeftPanel = styled.div({
  flex: 1,
  display: "flex",
  flexDirection: "column",
  maxWidth: 350
});

const RightPanel = styled.div({
  flex: 1,
  display: "flex",
  flexDirection: "column",
});

const TopRow = styled.div({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
});

const AddRecipeButton = styled.button({
  backgroundColor: "#f2c61d",
  border: "3px solid #d9b526",
  borderRadius: "1rem",
  padding: "0.3rem 1.2rem",
  textDecoration: "none",
  fontSize: "1rem",
});

const RecipeNameInput = styled.input({
  fontSize: "2rem",
});

const RecipeSettingsContainer = styled.div({
  display: "flex",
  flexDirection: "row",
  gap: "1rem",
  alignItems: "center",
  justifyContent: "space-between",
});

const saveRecipe = async (recipe: z.infer<typeof createRecipeSchema>) => {
  const response = await fetch("/api/recipes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(recipe)
  });

  const data = await response.json();

  return data as ReturnType<Awaited<typeof createRecipe>>;
};

export default function NewRecipePage() {
  const router = useRouter();

  const [name, setName] = useState("New recipe");
  const [description, setDescription] = useState("");

  const [ingredientSections, setIngredientSections] = useState<RawIngredientSection[]>([{
    name: "Main ingredients",
    ingredients: [{
      name: "Eggs",
      quantity: 12,
      unit: null
    }, {
        name: "Milk",
        quantity: 1,
        unit: "LITER"
      }]
  }]);

  const [instructions, setInstructions] = useState<string[]>([
    "Put eggs in a bowl",
    "Put milk in a bowl",
    "Mix eggs and milk",
  ]);

  const [recipeQuantity, setRecipeQuantity] = useState(1);
  const [isPublic, setIsPublic] = useState(false);

  return <Container>
    <form onSubmit={async (e) => {
      e.preventDefault();
      // TODO: Show loading indicator while saving
      const recipe = await saveRecipe({
        name,
        description,
        ingredientSections: ingredientSections,
        instructions,
        quantity: recipeQuantity,
        isPublic,
      });
      if (recipe) {
        router.push("/recipe/" + recipe.id);
      }
      else {
        // TODO: Show a notification to the user that the recipe failed to save.
        console.log("Failed to save recipe");
      }
    }}>
      <TopRow>
        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem"
        }}>
          <RecipeNameInput
            type="text"
            placeholder="Recipe name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
          <RecipeSettingsContainer>
            <RecipeQuantityPicker
              quantity={recipeQuantity}
              onChange={setRecipeQuantity}
            />
            <div>
              <label htmlFor="is-public">Public</label>
              <input
                id="is-public"
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
              />
            </div>
          </RecipeSettingsContainer>
        </div>
        <AddRecipeButton type="submit">Save recipe</AddRecipeButton>
      </TopRow>
    </form>
    {/* TODO: Add h1 tag somewhere*/}
    <SplitContainer>
      <LeftPanel>
        <h2>Ingredients</h2>
        {/* TODO: Implement adding multiple sections */}
        <EditableIngredientList
          ingredients={ingredientSections[0].ingredients}
          addIngredient={(ingredient) => {
            setIngredientSections([{
              ...ingredientSections[0],
              ingredients: [...ingredientSections[0].ingredients, ingredient]
            }]);
          }}
          removeIngredient={(index) => {
            setIngredientSections([{
              ...ingredientSections[0],
              ingredients: ingredientSections[0].ingredients.filter((_, i) => i !== index)
            }]);
          }}
        />
      </LeftPanel>
      <RightPanel>
        <h2>Instructions</h2>
        <EditableInstructionList
          instructions={instructions}
          addInstruction={(instruction) => setInstructions([...instructions, instruction])}
          removeInstruction={(index) => setInstructions(instructions.filter((_, i) => i !== index))}
        />
      </RightPanel>
    </SplitContainer>
  </Container >;
}
