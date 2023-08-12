import { Button } from "../../button/Button";
import { InfoDisclaimer } from "../../disclaimers/InfoDisclaimer";
import styles from "./AddRecipeToCollectionDialog.module.css";
import type { RecipeCollection } from "@prisma/client";
import { RecipeVisibility } from "@prisma/client";
import { useTranslation } from "next-i18next";
import { useId, useState } from "react";

export type AddRecipeToCollectionDialogProps = {
  collections: RecipeCollection[];
  onAdd: (collectionIds: string[]) => void;
  recipeVisibility: RecipeVisibility;
  selectedCollectionIds: string[];
};

type RowProps = {
  name: string;
  onChange: (checked: boolean) => void;
  selected: boolean;
};

const Row = (props: RowProps) => {
  const id = useId();

  return (
    <li>
      <label htmlFor={id} className={styles.row}>
        <input
          className={styles.rowCheckbox}
          id={id}
          type="checkbox"
          checked={props.selected}
          onChange={(e) => {
            props.onChange(e.target.checked);
          }}
        />
        {props.name}
      </label>
    </li>
  );
};

export const AddRecipeToCollectionDialog = ({
  collections,
  onAdd,
  recipeVisibility,
  selectedCollectionIds: initialSelectedCollectionIds,
}: AddRecipeToCollectionDialogProps) => {
  const { t } = useTranslation("recipeView");
  const [selectedCollectionIds, setSelectedCollectionIds] = useState(
    initialSelectedCollectionIds,
  );

  const hiddenDisclaimer = {
    [RecipeVisibility.PUBLIC]: null,
    [RecipeVisibility.UNLISTED]: t("collections.hiddenDisclaimers.unlisted"),
    [RecipeVisibility.PRIVATE]: t("collections.hiddenDisclaimers.private"),
  }[recipeVisibility];

  return (
    <div className={styles.container}>
      <h1>{t("collections.title")}</h1>
      {hiddenDisclaimer && <InfoDisclaimer>{hiddenDisclaimer}</InfoDisclaimer>}
      <ul>
        {collections.map((collection) => (
          <Row
            key={collection.id}
            name={collection.name}
            selected={selectedCollectionIds.includes(collection.id)}
            onChange={(selected) => {
              if (selected) {
                setSelectedCollectionIds([
                  ...selectedCollectionIds,
                  collection.id,
                ]);
              } else {
                setSelectedCollectionIds(
                  selectedCollectionIds.filter((id) => id !== collection.id),
                );
              }
            }}
          />
        ))}
      </ul>
      <Button
        onClick={() => {
          onAdd(selectedCollectionIds);
        }}
      >
        {t("collections.addToCollections", {
          count: selectedCollectionIds.length,
        })}
      </Button>
    </div>
  );
};
