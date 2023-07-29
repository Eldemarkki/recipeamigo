import { Editor } from "@tiptap/react";
import { useTranslation } from "next-i18next";
import { useId, useState } from "react";
import { NumberInput } from "../../forms/NumberInput";
import { Button } from "../../button/Button";

export type NewCountdownDialogProps = {
  editor: Editor | null;
  setIsDialogOpen: (open: boolean) => void;
};

export const NewCountdownDialog = ({
  editor,
  setIsDialogOpen,
}: NewCountdownDialogProps) => {
  const inputId = useId();
  const { t } = useTranslation(["common", "recipeView"]);

  const [seconds, setSeconds] = useState<number | undefined>(undefined);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <h1>{t("recipeView:edit.misc.countdown.newCountdownTitle")}</h1>
      <form
        style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
        onSubmit={(e) => {
          e.preventDefault();
          editor
            ?.chain()
            .focus()
            .setCountdown({ seconds: seconds || 0 })
            .run();
          setIsDialogOpen(false);
          setSeconds(undefined);
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <label htmlFor={inputId}>
            {t("recipeView:edit.misc.countdown.durationLabel")}
          </label>
          <NumberInput
            autoFocus
            value={seconds}
            onChange={setSeconds}
            id={inputId}
          />
        </div>
        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            setSeconds(undefined);
            setIsDialogOpen(false);
          }}
        >
          {t("common:actions.cancel")}
        </Button>
        <Button type="submit">{t("common:actions.save")}</Button>
      </form>
    </div>
  );
};
