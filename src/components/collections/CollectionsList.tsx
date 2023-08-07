import styles from "./CollectionsList.module.css";
import { CollectionsListItem } from "./CollectionsListItem";
import type { RecipeCollection } from "@prisma/client";

export type CollectionsListProps = {
  collections: (RecipeCollection & {
    _count: {
      RecipesOnCollections: number;
    };
    user: {
      username: string;
    };
  })[];
};

export const CollectionsList = ({ collections }: CollectionsListProps) => {
  return (
    <ul className={styles.list}>
      {collections.map((collection) => (
        <CollectionsListItem key={collection.id} collection={collection} />
      ))}
    </ul>
  );
};
