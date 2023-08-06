import { getSingleRecipe } from "../../database/recipes";
import { Locale } from "../../i18next";
import { recipeToMarkdown } from "../../utils/exportUtils";
import { LinkButton } from "../LinkButton";
import { Button } from "./Button";
import styles from "./ExportButton.module.css";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ChevronDownIcon } from "@radix-ui/react-icons";
import { useTranslation } from "next-i18next";

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
            <DropdownMenu.Item className={styles.dialogButton} asChild>
              <LinkButton
                variant="secondary"
                rectangular
                href={`/api/recipes/${recipe.id}/export/pdf?locale=${i18n.language}`}
              >
                {t("actions.exportAsPdf")}
              </LinkButton>
            </DropdownMenu.Item>
            <DropdownMenu.Item className={styles.dialogButton} asChild>
              <Button
                textAlign="left"
                variant="secondary"
                rectangular
                onClick={() => {
                  exportRecipe(JSON.stringify(recipe), exportJsonFilename);
                }}
              >
                {t("actions.exportAsJson")}
              </Button>
            </DropdownMenu.Item>
            <DropdownMenu.Item className={styles.dialogButton}>
              <Button
                textAlign="left"
                variant="secondary"
                rectangular
                onClick={() => {
                  exportRecipe(
                    recipeToMarkdown(recipe, i18n.language as Locale),
                    exportMarkdownFilename,
                  );
                }}
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
