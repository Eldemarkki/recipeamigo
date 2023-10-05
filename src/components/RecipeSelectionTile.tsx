import styles from "./RecipeSelectionTile.module.css";
import { Button } from "./button/Button";
import { Link } from "./link/Link";
import { VisibilityText } from "./misc/VisibilityText";
import type { RecipeVisibility } from "@prisma/client";
import { ImageIcon } from "@radix-ui/react-icons";
import { useTranslation } from "next-i18next";
import Image from "next/image";

export type RecipeSelectionTileProps = {
  id: string;
  name: string;
  coverImageUrl?: string | undefined | null;
  isSelected: boolean;
  visibility: RecipeVisibility;
  onClickSelect: () => void;
  selectable?: boolean | undefined | null;
};

export const RecipeSelectionTile = ({
  selectable = true,
  ...props
}: RecipeSelectionTileProps) => {
  const { t } = useTranslation(["home", "recipeView"]);

  return (
    <div className={styles.container}>
      <div className={styles.coverImageContainer}>
        {props.coverImageUrl ? (
          <Image
            className={styles.coverImage}
            src={props.coverImageUrl}
            alt={t("collections.tile.placeholderAltText")}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <ImageIcon width={100} height={40} />
        )}
      </div>
      <div className={styles.recipeInfoContainer}>
        <h3>
          <Link href={`/recipe/${props.id}`} target="_blank">
            {props.name}
          </Link>
        </h3>
        <VisibilityText type="recipe" visibility={props.visibility} />
        <Button
          onClick={props.onClickSelect}
          variant={!props.isSelected ? "secondary" : "primary"}
          className={styles.button}
          disabled={!selectable}
        >
          {props.isSelected
            ? t("collections.tile.removeButton")
            : t("collections.tile.addButton")}
        </Button>
      </div>
    </div>
  );
};
