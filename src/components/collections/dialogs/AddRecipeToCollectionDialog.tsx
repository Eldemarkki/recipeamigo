import { useErrors } from "../../../hooks/useErrors";
import { useLoadingState } from "../../../hooks/useLoadingState";
import type { ErrorCode } from "../../../utils/errors";
import { LinkButton } from "../../LinkButton";
import { Button } from "../../button/Button";
import { InfoDisclaimer } from "../../disclaimers/InfoDisclaimer";
import { ErrorText } from "../../error/ErrorText";
import styles from "./AddRecipeToCollectionDialog.module.css";
import type { RecipeCollection } from "@prisma/client";
import { RecipeVisibility } from "@prisma/client";
import { useTranslation } from "next-i18next";
import { useId, useState } from "react";

export type AddRecipeToCollectionDialogProps = {
  collections: RecipeCollection[];
  onAdd: (
    collectionIds: string[],
  ) => Promise<{ errorCode: ErrorCode } | undefined>;
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
  const { isLoading, startLoading, stopLoading } = useLoadingState();
  const [selectedCollectionIds, setSelectedCollectionIds] = useState(
    initialSelectedCollectionIds,
  );
  const { getErrorMessage } = useErrors();
  const [errorText, setErrorText] = useState<string | null>(null);

  if (collections.length === 0) {
    return (
      <>
        <p>{t("collections.noCollections.text")}</p>
        <LinkButton href="/collections/new">
          {t("collections.noCollections.link")}
        </LinkButton>
      </>
    );
  }

  const removedFromCollections = initialSelectedCollectionIds.filter(
    (id) => !selectedCollectionIds.includes(id),
  );

  const addedToCollections = selectedCollectionIds.filter(
    (id) => !initialSelectedCollectionIds.includes(id),
  );

  const isDifferent =
    removedFromCollections.length > 0 || addedToCollections.length > 0;

  const hiddenDisclaimer = {
    [RecipeVisibility.PUBLIC]: null,
    [RecipeVisibility.UNLISTED]: t("collections.hiddenDisclaimers.unlisted"),
    [RecipeVisibility.PRIVATE]: t("collections.hiddenDisclaimers.private"),
  }[recipeVisibility];

  const handleAdd = async () => {
    startLoading();
    setErrorText(null);
    const error = await onAdd(selectedCollectionIds);
    if (error) {
      setErrorText(getErrorMessage(error.errorCode));
    }
    stopLoading();
  };

  return (
    <>
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
      {errorText && <ErrorText>{errorText}</ErrorText>}
      <Button
        disabled={!isDifferent}
        loading={isLoading}
        onClick={() => {
          void handleAdd();
        }}
      >
        {addedToCollections.length > 0 && removedFromCollections.length > 0
          ? t("collections.addAndRemoveFromCollections", {
              addCount: addedToCollections.length,
              removeCount: removedFromCollections.length,
            })
          : addedToCollections.length > 0 && removedFromCollections.length === 0
          ? t("collections.addToCollections", {
              count: addedToCollections.length,
            })
          : addedToCollections.length === 0 && removedFromCollections.length > 0
          ? t("collections.removeFromCollections", {
              count: removedFromCollections.length,
            })
          : t("collections.noEdits")}
      </Button>
    </>
  );
};
