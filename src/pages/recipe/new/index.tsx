import { useState } from "react";
import { IngredientList } from "../../../components/recipeEngine/IngredientList";
import { RawIngredient } from "../../../components/recipeEngine/IngredientForm";
import { InstructionList } from "../../../components/recipeEngine/InstructionList";

export default function NewRecipePage() {
  const [ingredients, setIngredients] = useState<RawIngredient[]>([{
    name: "Eggs",
    quantity: 12,
    unit: null
  }, {
    name: "Milk",
    quantity: 1,
    unit: "LITER"
  }]);

  const [instructions, setInstructions] = useState<string[]>([
    "Put eggs in a bowl",
    "Put milk in a bowl",
    "Mix eggs and milk",
  ]);

  return <main style={{
    margin: 300,
  }}>
    <h1>New recipe</h1>
    {/* <IngredientList
      ingredients={ingredients}
      addIngredient={(ingredient) => setIngredients([...ingredients, ingredient])}
      removeIngredient={(index) => setIngredients(ingredients.filter((_, i) => i !== index))}
    /> */}
    <InstructionList
      instructions={instructions}
      addInstruction={(instruction) => setInstructions([...instructions, instruction])}
      removeInstruction={(index) => setInstructions(instructions.filter((_, i) => i !== index))}
    />
  </main>;
}
