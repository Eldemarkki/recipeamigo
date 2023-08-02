import styles from "./VisibilityText.module.css";
import { RecipeCollectionVisibility, RecipeVisibility } from "@prisma/client";
import {
  EyeClosedIcon,
  EyeOpenIcon,
  LockClosedIcon,
} from "@radix-ui/react-icons";
import { useTranslation } from "next-i18next";

// TODO: Refactor. I want to keep RecipeVisibility and RecipeCollectionVisibility separate, but this is a bit messy.

export type VisibilityTextProps =
  | {
      type: "recipe";
      visibility: RecipeVisibility;
    }
  | {
      type: "collection";
      visibility: RecipeCollectionVisibility;
    };

const RecipeVisibilityIcon = {
  [RecipeVisibility.PRIVATE]: <LockClosedIcon />,
  [RecipeVisibility.PUBLIC]: <EyeOpenIcon />,
  [RecipeVisibility.UNLISTED]: <EyeClosedIcon />,
};

const RecipeCollectionVisibilityIcon = {
  [RecipeCollectionVisibility.PRIVATE]: <LockClosedIcon />,
  [RecipeCollectionVisibility.PUBLIC]: <EyeOpenIcon />,
  [RecipeCollectionVisibility.UNLISTED]: <EyeClosedIcon />,
};

export const VisibilityText = (props: VisibilityTextProps) => {
  const { t } = useTranslation(["recipeView", "home"]);

  const Icon =
    props.type === "recipe"
      ? RecipeVisibilityIcon[props.visibility]
      : RecipeCollectionVisibilityIcon[props.visibility];

  const recipeCollectionVisibilityLabelMap: Record<
    RecipeCollectionVisibility,
    string
  > = {
    [RecipeCollectionVisibility.PRIVATE]: t(
      "home:collections.visibility.private",
    ),
    [RecipeCollectionVisibility.PUBLIC]: t(
      "home:collections.visibility.public",
    ),
    [RecipeCollectionVisibility.UNLISTED]: t(
      "home:collections.visibility.unlisted",
    ),
  };

  const recipeVisibilityLabelMap: Record<RecipeVisibility, string> = {
    [RecipeVisibility.PRIVATE]: t("recipeVisibility.private"),
    [RecipeVisibility.PUBLIC]: t("recipeVisibility.public"),
    [RecipeVisibility.UNLISTED]: t("recipeVisibility.unlisted"),
  };

  const label =
    props.type === "recipe"
      ? recipeVisibilityLabelMap[props.visibility]
      : recipeCollectionVisibilityLabelMap[props.visibility];

  return (
    <span className={styles.container}>
      {Icon}
      {label}
    </span>
  );
};
