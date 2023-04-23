import Link from "next/link";
import styles from "./NewRecipeButton.module.css";

export const NewRecipeButton = () => {
  return <Link
    className={styles.linkButton}
    href="/recipe/new"
  >
    New recipe
  </Link>;
};
