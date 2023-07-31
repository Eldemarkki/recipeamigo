import { RecipeCollection } from "@prisma/client";
import styles from "./CollectionsListItem.module.css";
import { Link } from "../link/Link";
import { useTranslation } from "next-i18next";
import { PersonIcon, ReaderIcon } from "@radix-ui/react-icons";

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
      <h3 className={styles.itemTitle}>
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
      <p className={styles.description}>{collection.description}</p>
    </li>
  );
};
