import { getErrorFromResponse } from "../../utils/errors";
import { Select } from "../Select";
import { Button } from "../button/Button";
import { ConfirmationDialog } from "../dialog/ConfirmationDialog";
import { Dialog } from "../dialog/Dialog";
import { NumberInput } from "../forms/NumberInput";
import { RecipeQuantityPicker } from "../recipeView/RecipeQuantityPicker";
import { TagSelect } from "../tag/TagSelect";
import styles from "./RecipeSettingsEditDialog.module.css";
import { RecipeVisibility } from "@prisma/client";
import { TrashIcon } from "@radix-ui/react-icons";
import { Trans, useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { useId, useState } from "react";
import { toast } from "react-hot-toast";

export type RecipeSettingsEditDialogProps = {
  dialogOpen: boolean;
  setDialogOpen: (value: boolean) => void;
  timeEstimateMin: number | undefined;
  setTimeEstimateMin: (value: number) => void;
  timeEstimateMax: number | undefined;
  setTimeEstimateMax: (value: number) => void;
  recipeQuantity: number;
  setRecipeQuantity: (value: number) => void;
  visibility: RecipeVisibility;
  setVisibility: (value: RecipeVisibility) => void;
  tags: { id?: string; text: string }[];
  setTags: (tags: { id?: string; text: string }[]) => void;
} & (
  | {
      type: "new";
    }
  | {
      type: "edit";
      recipeId: string;
    }
);

export const RecipeSettingsEditDialog = ({
  dialogOpen,
  setDialogOpen,
  timeEstimateMin,
  setTimeEstimateMin,
  timeEstimateMax,
  setTimeEstimateMax,
  recipeQuantity,
  setRecipeQuantity,
  visibility,
  setVisibility,
  tags,
  setTags,
  ...props
}: RecipeSettingsEditDialogProps) => {
  const { t } = useTranslation(["recipeView", "common"]);
  const router = useRouter();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const visibilityId = useId();
  const tagSelectId = useId();

  const visibilityLabelMap: Record<RecipeVisibility, string> = {
    [RecipeVisibility.PRIVATE]: t("recipeVisibility.private"),
    [RecipeVisibility.PUBLIC]: t("recipeVisibility.public"),
    [RecipeVisibility.UNLISTED]: t("recipeVisibility.unlisted"),
  };

  const deleteRecipe = async () => {
    if (props.type === "edit") {
      const response = await fetch(`/api/recipes/${props.recipeId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        return getErrorFromResponse(response);
      }

      await router.push("/");
      toast.success(t("edit.delete.success"));
    }
  };

  return (
    <Dialog
      open={dialogOpen}
      closeDialog={() => {
        setDeleteDialogOpen(false);
        setDialogOpen(false);
      }}
      overflowVisible // TODO: This is broken if user adds a lot of tags
      title={t("edit.settings.title")}
    >
      <ConfirmationDialog
        isOpen={deleteDialogOpen}
        message={t("edit.delete.text")}
        onConfirm={() => {
          void deleteRecipe();
        }}
        onCancel={() => {
          setDeleteDialogOpen(false);
        }}
        title={t("edit.delete.title")}
        cancelButtonText={t("common:actions.cancel")}
        confirmButtonText={t("common:actions.delete")}
      />
      <div className={styles.dialogContent}>
        <div className={styles.settingsContainer}>
          <div className={styles.recipeSettingsContainer}>
            <span>{t("edit.timeEstimateTitle")}</span>
            {/* TODO: Allow empty value (now it's just 0 if user tries to clear all) */}
            <div>
              <Trans i18nKey="recipeView:edit.timeEstimate">
                <NumberInput
                  value={timeEstimateMin}
                  onChange={setTimeEstimateMin}
                  min={0}
                  style={{
                    width: "3rem",
                    textAlign: "center",
                  }}
                />
                <span>min </span>
                <span>to </span>
                <NumberInput
                  value={timeEstimateMax}
                  onChange={setTimeEstimateMax}
                  min={0}
                  style={{
                    width: "3rem",
                    textAlign: "center",
                  }}
                />
                <span>min</span>
              </Trans>
            </div>
          </div>
          <RecipeQuantityPicker
            quantity={recipeQuantity}
            onChange={setRecipeQuantity}
          />
          <div className={styles.recipeSettingsContainer}>
            <label htmlFor={visibilityId}>{t("edit.visibility")}</label>
            <Select
              id={visibilityId}
              options={[
                {
                  label: t("recipeVisibility.private"),
                  value: RecipeVisibility.PRIVATE,
                },
                {
                  label: t("recipeVisibility.public"),
                  value: RecipeVisibility.PUBLIC,
                },
                {
                  label: t("recipeVisibility.unlisted"),
                  value: RecipeVisibility.UNLISTED,
                },
              ]}
              value={{
                label: visibilityLabelMap[visibility],
                value: visibility,
              }}
              onChange={(option) => {
                if (option) {
                  setVisibility(option.value);
                }
              }}
            />
          </div>
          <div className={styles.tagsContainer}>
            <label htmlFor={tagSelectId}>{t("edit.settings.tagsLabel")}</label>
            <TagSelect
              id={tagSelectId}
              tags={tags.map((t) => t.text)}
              setTags={(newTags) => {
                setTags(newTags.map((t) => ({ text: t })));
              }}
            />
          </div>
        </div>
        <div className={styles.buttonRow}>
          {props.type === "edit" && (
            <Button
              variant="danger"
              icon={<TrashIcon />}
              onClick={() => {
                setDeleteDialogOpen(true);
              }}
            >
              {t("common:actions.delete")}
            </Button>
          )}
          <Button
            className={styles.settingsSaveButton}
            onClick={() => {
              setDialogOpen(false);
            }}
          >
            {t("common:actions.save")}
          </Button>
        </div>
      </div>
    </Dialog>
  );
};
