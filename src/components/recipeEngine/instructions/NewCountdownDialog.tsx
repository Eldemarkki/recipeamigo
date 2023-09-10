import { Button } from "../../button/Button";
import { DurationInput } from "./DurationInput";
import styles from "./NewCountdownDialog.module.css";
import type { Editor } from "@tiptap/react";
import { useTranslation } from "next-i18next";
import { useState } from "react";

export type NewCountdownDialogProps = {
  editor: Editor | null;
  setIsDialogOpen: (open: boolean) => void;
};

export const NewCountdownDialog = ({
  editor,
  setIsDialogOpen,
}: NewCountdownDialogProps) => {
  const { t } = useTranslation(["common", "recipeView"]);

  const [seconds, setSeconds] = useState<number | undefined>(undefined);

  return (
    <div className={styles.container}>
      <form
        className={styles.form}
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
        <DurationInput seconds={seconds || 0} setSeconds={setSeconds} />
        <div className={styles.buttonsContainer}>
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
        </div>
      </form>
    </div>
  );
};
