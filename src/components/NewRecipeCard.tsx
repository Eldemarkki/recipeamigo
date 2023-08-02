import styles from "./NewRecipeCard.module.css";
import { Link } from "./link/Link";
import { PlusIcon } from "@radix-ui/react-icons";
import { useTranslation } from "next-i18next";

export const NewRecipeCard = () => {
  const { t } = useTranslation("home");
  return (
    <Link className={styles.link} href="/recipe/new">
      <PlusIcon width={24} height={24} />
      {t("newRecipeButtonLong")}
    </Link>
  );
};
