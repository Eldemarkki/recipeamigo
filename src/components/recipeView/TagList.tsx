import { Tag, isSpecialTagValue, tagTranslationKeys } from "../tag/Tag";
import styles from "./TagList.module.css";
import type { Tag as TagType } from "@prisma/client";
import { useTranslation } from "next-i18next";

export type TagListProps = {
  tags: TagType[];
};

export const TagList = ({ tags }: TagListProps) => {
  const { t } = useTranslation();

  return (
    <ul className={styles.list}>
      {tags.map(({ text }) => (
        <li key={text}>
          {isSpecialTagValue(text) ? (
            <Tag type={text}>{t(tagTranslationKeys[text])}</Tag>
          ) : (
            <Tag>{text}</Tag>
          )}
        </li>
      ))}
    </ul>
  );
};
