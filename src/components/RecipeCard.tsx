import styles from "./RecipeCard.module.css";
import { Link } from "./link/Link";
import { ImageIcon } from "@radix-ui/react-icons";
import Image from "next/image";

export type RecipeCardProps = {
  id: string;
  name: string;
  description: string;
  coverImageUrl?: string | undefined | null;
};

export const RecipeCard = (props: RecipeCardProps) => {
  return (
    <div className={styles.container}>
      <div className={styles.coverImageContainer}>
        {props.coverImageUrl ? (
          <Image
            className={styles.coverImage}
            src={props.coverImageUrl}
            alt="Recipe placeholder image"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <ImageIcon width={100} height={40} />
        )}
      </div>
      <div className={styles.recipeInfoContainer}>
        <Link href={`/recipe/${props.id}`}>
          <h3>{props.name}</h3>
        </Link>
        <p>{props.description}</p>
      </div>
    </div>
  );
};
