import { CircularButton } from "../../button/Button";
import styles from "./EditableIngredientList.module.css";
import { EditableIngredientSection } from "./EditableIngredientSection";
import type { RawIngredient, RawIngredientSection } from "./IngredientForm";
import { IngredientSectionForm } from "./IngredientSectionForm";
import { PlusIcon } from "@radix-ui/react-icons";
import { Reorder } from "framer-motion";
import { useState } from "react";

export type IngredientListProps = {
  ingredientSections: RawIngredientSection[];
  addIngredient: (
    ingredient: RawIngredient,
    ingredientSectionName: string,
  ) => void;
  removeIngredient: (index: number, ingredientSectionName: string) => void;
  addIngredientSection: (ingredientSectionName: string) => void;
  removeIngredientSection: (index: number) => void;
  setIngredientSectionIngredients: (
    index: number,
    items: RawIngredient[],
  ) => void;
  setIngredientSections: (items: RawIngredientSection[]) => void;
};

export const EditableIngredientList = ({
  ingredientSections,
  addIngredient,
  removeIngredient,
  addIngredientSection,
  removeIngredientSection,
  setIngredientSectionIngredients,
  setIngredientSections,
}: IngredientListProps) => {
  const [newItemType, setNewItemType] = useState<
    | { type: "ingredient"; ingredientSectionName: string }
    | { type: "section" }
    | null
  >(null);

  return (
    <div className={styles.container}>
      {ingredientSections.length > 0 && (
        <Reorder.Group
          className={styles.ingredientSections}
          onReorder={setIngredientSections}
          values={ingredientSections}
          axis="y"
        >
          {ingredientSections.map(
            (ingredientSection, ingredientSectionIndex) => (
              <EditableIngredientSection
                key={ingredientSection.name}
                ingredientSection={ingredientSection}
                onRemove={() => {
                  removeIngredientSection(ingredientSectionIndex);
                }}
                setIngredients={(ingredients) => {
                  setIngredientSectionIngredients(
                    ingredientSectionIndex,
                    ingredients,
                  );
                }}
                onRemoveIngredient={(ingredientIndex) => {
                  removeIngredient(ingredientIndex, ingredientSection.name);
                }}
                addIngredient={(ingredient) => {
                  addIngredient(ingredient, ingredientSection.name);
                }}
                newItemType={newItemType}
                setNewItemType={setNewItemType}
                onEditIngredient={(newIngredient, index) => {
                  setIngredientSectionIngredients(
                    ingredientSectionIndex,
                    ingredientSection.ingredients.map((ingredient, i) => {
                      if (i === index) {
                        return newIngredient;
                      }
                      return ingredient;
                    }),
                  );
                }}
                updateIngredientSectionName={(newName) => {
                  setIngredientSections(
                    ingredientSections.map((ingredientSection, i) =>
                      i === ingredientSectionIndex
                        ? {
                            ...ingredientSection,
                            name: newName,
                          }
                        : ingredientSection,
                    ),
                  );
                }}
              />
            ),
          )}
        </Reorder.Group>
      )}
      {newItemType && newItemType.type === "section" ? (
        <IngredientSectionForm
          addIngredientSection={(ingredientSectionName) => {
            addIngredientSection(ingredientSectionName);
            setNewItemType({ type: "ingredient", ingredientSectionName });
          }}
          onCancel={() => {
            setNewItemType(null);
          }}
        />
      ) : (
        <div className={styles.ingredientSectionBottomSection}>
          <CircularButton
            onClick={() => {
              setNewItemType({ type: "section" });
            }}
          >
            <PlusIcon />
          </CircularButton>
        </div>
      )}
    </div>
  );
};
