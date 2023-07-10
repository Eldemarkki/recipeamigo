import Image from "next/image";
import styles from "./RecipeSelectionTile.module.css";
import { ImageIcon } from "@radix-ui/react-icons";
import { Button } from "./button/Button";
import { useTranslation } from "next-i18next";

export type RecipeSelectionTileProps = {
  id: string;
  name: string;
  coverImageUrl?: string | undefined | null;
  isSelected: boolean;
  onClickSelect: () => void;
};

export const RecipeSelectionTile = (props: RecipeSelectionTileProps) => {
  const { t } = useTranslation("home");

  return <div className={styles.container}>
    <div className={styles.coverImageContainer}>
      {props.coverImageUrl
        ? <Image
          className={styles.coverImage}
          src={props.coverImageUrl}
          alt={t("collections.tile.placeholderAltText")}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        : <ImageIcon width={100} height={40} />}
    </div>
    <div className={styles.recipeInfoContainer}>
      <h3 className={styles.recipeName}>
        {props.name}
      </h3>
      <Button onClick={props.onClickSelect} variant={!props.isSelected ? "secondary" : "primary"} className={styles.button}>
        {props.isSelected ? t("collections.tile.removeButton") : t("collections.tile.addButton")}
      </Button>
    </div>
  </div>;
};
