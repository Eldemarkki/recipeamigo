import config from "../../config";
import { Link } from "../link/Link";
import styles from "./Navbar.module.css";
import { UserButton } from "@clerk/nextjs";
import { Cross1Icon, HamburgerMenuIcon } from "@radix-ui/react-icons";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export const Navbar = () => {
  const router = useRouter();
  const { t } = useTranslation("common");

  const [isOpen, setIsOpen] = useState(false);

  const toggleNavbar = () => {
    setIsOpen(!isOpen);

    // Prevent scrolling
    if (isOpen) {
      // Closing
      document.body.style.overflow = "auto";
    } else {
      // Opening
      document.body.style.overflow = "hidden";
    }
  };

  useEffect(() => {
    const handleRouteChange = () => {
      setIsOpen(false);
      document.body.style.overflow = "auto";
    };

    router.events.on("routeChangeStart", handleRouteChange);
    return () => {
      router.events.off("routeChangeStart", handleRouteChange);
    };
  }, [router.events]);

  return (
    <div className={styles.container + (isOpen ? " " + styles.navbarOpen : "")}>
      <div className={styles.titleRow}>
        <h1>
          <Link href="/">{config.APP_NAME}</Link>
        </h1>
        <button className={styles.toggleButton} onClick={toggleNavbar}>
          {isOpen ? (
            <Cross1Icon aria-label={t("navbar.closeNavbar")} />
          ) : (
            <HamburgerMenuIcon aria-label={t("navbar.openNavbar")} />
          )}
        </button>
      </div>
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
            <Link href="/likes">{t("navbar.likes")}</Link>
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
