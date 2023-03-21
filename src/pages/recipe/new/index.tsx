import { useState } from "react";
import { IngredientList } from "../../../components/recipeEngine/IngredientList";
import { RawIngredient } from "../../../components/recipeEngine/IngredientForm";

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

  return <main style={{
    margin: 300,
  }}>
    <h1>New recipe</h1>
    <IngredientList
      ingredients={ingredients}
      addIngredient={(ingredient) => setIngredients([...ingredients, ingredient])}
      removeIngredient={(index) => setIngredients(ingredients.filter((_, i) => i !== index))}
    />
  </main>;
}
