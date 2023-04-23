import Image from "next/image";
import Link from "next/link";
import PlaceholderImage from "../images/recipe_placeholder.jpg";
import styles from "./RecipeCard.module.css";

export type RecipeCardProps = {
  id: string;
  name: string;
  description: string;
}

export const RecipeCard = (props: RecipeCardProps) => {
  return <div className={styles.container}>
    <div style={{
      position: "relative",
      width: "100%",
      height: "10rem",
      overflow: "hidden",
      borderRadius: "0.5rem 0.5rem 0 0",
    }}>
      <Image
        src={PlaceholderImage}
        alt="Recipe placeholder image"
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        style={{
          objectFit: "cover",
          objectPosition: "center",
        }}
      />
    </div>
    <div className={styles.recipeInfoContainer}>
      <Link href={`/recipe/${props.id}`}>
        <h3 className={styles.recipeName}>
          {props.name}
        </h3>
      </Link>
      <p className={styles.recipeDescription}>{props.description}</p>
    </div>
  </div>;
};
