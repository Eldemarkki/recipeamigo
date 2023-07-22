import { PlusIcon } from "@radix-ui/react-icons";
import {
  IngredientForm,
  RawIngredient,
  RawIngredientSection,
} from "./IngredientForm";
import { Reorder, useDragControls } from "framer-motion";
import { EditableIngredientListItem } from "./EditableIngredientListItem";
import { DeleteButton } from "../../button/DeleteButton";
import { CircularButton } from "../../button/Button";
import { DragHandle } from "../../misc/DragHandle";
import styles from "./EditableIngredientSection.module.css";

export type EditableIngredientSectionProps = {
  ingredientSection: RawIngredientSection;
  onRemove: () => void;
  setIngredients: (ingredients: RawIngredient[]) => void;
  onRemoveIngredient: (ingredientIndex: number) => void;
  newItemType:
    | { type: "ingredient"; ingredientSectionName: string }
    | { type: "section" }
    | null;
  setNewItemType: (
    newItemType: EditableIngredientSectionProps["newItemType"],
  ) => void;
  addIngredient: (ingredient: RawIngredient) => void;
  onEditIngredient: (ingredient: RawIngredient, index: number) => void;
};

export const EditableIngredientSection = ({
  ingredientSection,
  onRemove,
  setIngredients,
  onRemoveIngredient,
  newItemType,
  setNewItemType,
  addIngredient,
  onEditIngredient,
}: EditableIngredientSectionProps) => {
  const controls = useDragControls();

  return (
    <Reorder.Item
      className={styles.container}
      value={ingredientSection}
      dragListener={false}
      dragControls={controls}
    >
      <div className={styles.topRow}>
        <DragHandle
          onPointerDown={(e) => {
            controls.start(e);
            e.preventDefault();
          }}
        />
        <h3 className={styles.title}>{ingredientSection.name}</h3>
        <DeleteButton
          onClick={() => {
            // TODO: Implement a more beautiful confirmation dialog
            if (
              confirm(
                `Are you sure you want to delete the ingredient section "${ingredientSection.name}"?`,
              )
            ) {
              onRemove();
            }
          }}
        />
      </div>
      <Reorder.Group
        className={styles.ingredientList}
        axis="y"
        values={ingredientSection.ingredients}
        onReorder={(items) => {
          setIngredients(items as RawIngredient[]);
        }}
      >
        {ingredientSection.ingredients.map((ingredient, index) => (
          <EditableIngredientListItem
            key={ingredient.name}
            ingredient={ingredient}
            onEditIngredient={(i) => onEditIngredient(i, index)}
            onRemove={() => onRemoveIngredient(index)}
          />
        ))}
      </Reorder.Group>
      {newItemType &&
      newItemType.type === "ingredient" &&
      newItemType.ingredientSectionName === ingredientSection.name ? (
        <IngredientForm
          type="new"
          addIngredient={addIngredient}
          onCancel={() => setNewItemType(null)}
        />
      ) : (
        <div className={styles.ingredientSectionBottomSection}>
          <CircularButton
            onClick={() =>
              setNewItemType({
                type: "ingredient",
                ingredientSectionName: ingredientSection.name,
              })
            }
          >
            <PlusIcon />
          </CircularButton>
        </div>
      )}
    </Reorder.Item>
  );
};
