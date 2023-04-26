import { PlusIcon } from "@radix-ui/react-icons";
import styles from "./NewRecipeCard.module.css";
import { Link } from "./link/Link";

export const NewRecipeCard = () => {
  return <Link className={styles.link} href="/recipe/new">
    <PlusIcon width={24} height={24} />
    Create new recipe
  </Link>;
};
