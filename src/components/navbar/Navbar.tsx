import { useTranslation } from "next-i18next";
import config from "../../config";
import { Link } from "../link/Link";
import styles from "./Navbar.module.css";
import { UserButton } from "@clerk/nextjs";

export const Navbar = () => {
  const { t } = useTranslation();

  return (
    <div className={styles.container}>
      <h1>
        <Link href="/">{config.APP_NAME}</Link>
      </h1>
      <nav className={styles.navbar}>
        <ol className={styles.linkList}>
          <li>
            <Link href="/">{t("navbar.home")}</Link>
          </li>
          <li>
            <Link href="/browse">{t("navbar.browse")}</Link>
          </li>
          <li>
            <Link href="/browse/collections">
              {t("navbar.browseCollections")}
            </Link>
          </li>
          <li>
            <Link href="/settings">{t("navbar.settings")}</Link>
          </li>
        </ol>
        <UserButton afterSignOutUrl="/" />
      </nav>
    </div>
  );
};
