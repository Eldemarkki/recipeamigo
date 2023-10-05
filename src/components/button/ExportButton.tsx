import type { getSingleRecipe } from "../../database/recipes";
import type { Locale } from "../../i18next";
import { recipeToMarkdown } from "../../utils/exportUtils";
import { LinkButton } from "../LinkButton";
import { Button } from "./Button";
import styles from "./ExportButton.module.css";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ChevronDownIcon } from "@radix-ui/react-icons";
import { useTranslation } from "next-i18next";
import { LiaMarkdown } from "react-icons/lia";
import { LuFileJson } from "react-icons/lu";
import { PiExport, PiFilePdf } from "react-icons/pi";

export type ExportButtonProps = {
  recipe: Exclude<Awaited<ReturnType<typeof getSingleRecipe>>, null>;
  exportMarkdownFilename: string;
  exportJsonFilename: string;
};

const exportRecipe = (data: string, filename: string) => {
  const a = document.createElement("a");
  const url = URL.createObjectURL(new Blob([data], { type: "text/json" }));
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
};

// TODO: Doesn't work with right-to-left layout
export const ExportButton = ({
  recipe,
  exportJsonFilename,
  exportMarkdownFilename,
}: ExportButtonProps) => {
  const { t, i18n } = useTranslation("common");

  return (
    <div className={styles.container}>
      <LinkButton
        className={styles.mainExportButton}
        rectangular
        href={`/api/recipes/${recipe.id}/export/pdf?locale=${i18n.language}`}
        icon={<PiExport size={18} />}
      >
        {t("actions.export")}
      </LinkButton>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <Button className={styles.dialogOpenButton} rectangular>
            <ChevronDownIcon />
          </Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            align="end"
            className={styles.dialog}
            sideOffset={8}
          >
            <DropdownMenu.Item asChild>
              <LinkButton
                className={styles.dialogButton}
                variant="secondary"
                rectangular
                href={`/api/recipes/${recipe.id}/export/pdf?locale=${i18n.language}`}
                icon={<PiFilePdf />}
              >
                {t("actions.exportAsPdf")}
              </LinkButton>
            </DropdownMenu.Item>
            <DropdownMenu.Item className={styles.dialogButton} asChild>
              <Button
                className={styles.dialogButton}
                variant="secondary"
                rectangular
                onClick={() => {
                  exportRecipe(JSON.stringify(recipe), exportJsonFilename);
                }}
                icon={<LuFileJson />}
              >
                {t("actions.exportAsJson")}
              </Button>
            </DropdownMenu.Item>
            <DropdownMenu.Item className={styles.dialogButton}>
              <Button
                className={styles.dialogButton}
                variant="secondary"
                rectangular
                onClick={() => {
                  exportRecipe(
                    recipeToMarkdown(recipe, i18n.language as Locale),
                    exportMarkdownFilename,
                  );
                }}
                icon={<LiaMarkdown />}
              >
                {t("actions.exportAsMarkdown")}
              </Button>
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </div>
  );
};
