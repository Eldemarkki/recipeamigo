import { useTranslation } from "next-i18next";
import config from "../../config";
import { Link } from "../link/Link";
import styles from "./Navbar.module.css";

export type NavbarProps = {
  isLoggedIn: boolean
}

export const Navbar = ({ isLoggedIn }: NavbarProps) => {
  const { t } = useTranslation();

  return <div className={styles.container}>
    <h1 className={styles.title}>
      <Link href="/">
        {config.APP_NAME}
      </Link>
    </h1>
    <nav>
      <ol className={styles.linkList}>
        <li>
          <Link href="/">{t("navbar.home")}</Link>
        </li>
        <li>
          <Link href="/settings">{t("navbar.settings")}</Link>
        </li>
        {isLoggedIn &&
          <li>
            <Link href="/profile">{t("navbar.profile")}</Link>
          </li>}
      </ol>
    </nav>
  </div>;
};
