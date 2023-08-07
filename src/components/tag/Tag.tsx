import { DeleteButton } from "../button/DeleteButton";
import styles from "./Tag.module.css";
import type { ParseKeys } from "i18next";
import type { PropsWithChildren } from "react";

export enum TagType {
  LactoseFree = "lactoseFree",
  GlutenFree = "glutenFree",
  Vegan = "vegan",
  Vegetarian = "vegetarian",
}

export type TagProps = PropsWithChildren<{
  type?: TagType;
  onClickDelete?: () => void;
}>;

export const tagAdditionalClassname: Record<TagType, string> = {
  [TagType.LactoseFree]: styles.lactoseFree,
  [TagType.GlutenFree]: styles.glutenFree,
  [TagType.Vegan]: styles.vegan,
  [TagType.Vegetarian]: styles.vegetarian,
};

export const tagPrefixes: Record<TagType, string> = {
  [TagType.LactoseFree]: "🥛",
  [TagType.GlutenFree]: "🌾",
  [TagType.Vegan]: "🌱",
  [TagType.Vegetarian]: "🥕",
};

export const tagTranslationKeys: Record<TagType, `tags:${ParseKeys<"tags">}`> =
  {
    [TagType.LactoseFree]: "tags:lactoseFree",
    [TagType.GlutenFree]: "tags:glutenFree",
    [TagType.Vegan]: "tags:vegan",
    [TagType.Vegetarian]: "tags:vegetarian",
  };

export const isSpecialTagValue = (value: string): value is TagType => {
  return Object.values(TagType).includes(value as TagType);
};

export const Tag = ({ type, children, onClickDelete }: TagProps) => {
  const prefix = type ? tagPrefixes[type] + " " : undefined;

  return (
    <span
      className={styles.tag + (type ? " " + tagAdditionalClassname[type] : "")}
    >
      {prefix && <span>{prefix}</span>}
      {children && <span>{children}</span>}
      {onClickDelete && <DeleteButton onClick={onClickDelete} />}
    </span>
  );
};
