import { Link } from "../link/Link";
import styles from "./CollectionsListItem.module.css";
import type { RecipeCollection } from "@prisma/client";
import { PersonIcon, ReaderIcon } from "@radix-ui/react-icons";
import { useTranslation } from "next-i18next";

export type CollectionsListItemProps = {
  collection: RecipeCollection & {
    _count: {
      RecipesOnCollections: number;
    };
    user: {
      username: string;
    };
  };
};

export const CollectionsListItem = ({
  collection,
}: CollectionsListItemProps) => {
  const { t } = useTranslation("browse");

  return (
    <li className={styles.item}>
      <h3>
        <Link href={`/collections/${collection.id}`}>{collection.name}</Link>
      </h3>
      <div className={styles.info}>
        <span className={styles.infoRow}>
          <ReaderIcon />
          {t("collections.item.recipeCount", {
            count: collection._count.RecipesOnCollections,
          })}
        </span>
        <span className={styles.infoRow}>
          <PersonIcon />
          {collection.user.username}
        </span>
      </div>
      <p>{collection.description}</p>
    </li>
  );
};
