import config from "../../config";
import { LinkButton } from "../LinkButton";
import { Link } from "../link/Link";
import styles from "./Navbar.module.css";
import { UserButton, useAuth } from "@clerk/nextjs";
import { Cross1Icon, HamburgerMenuIcon } from "@radix-ui/react-icons";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";

export const Navbar = () => {
  const router = useRouter();
  const { t } = useTranslation("common");

  const { isSignedIn } = useAuth();

  const [isOpen, setIsOpen] = useState(false);

  const toggleNavbar = useCallback(
    (newIsOpen = !isOpen) => {
      setIsOpen(newIsOpen);

      // Prevent scrolling
      if (!newIsOpen) {
        // Closing
        document.body.style.overflow = "auto";
      } else {
        // Opening
        document.body.style.overflow = "hidden";
      }
    },
    [isOpen],
  );

  useEffect(() => {
    const handle = () => {
      toggleNavbar(false);
    };
    router.events.on("routeChangeStart", handle);
    return () => {
      router.events.off("routeChangeStart", handle);
    };
  }, [router.events, toggleNavbar]);

  return (
    <div className={styles.container + (isOpen ? " " + styles.navbarOpen : "")}>
      <div className={styles.titleRow}>
        <h1>
          <Link href="/">{config.APP_NAME}</Link>
        </h1>
        <button
          className={styles.toggleButton}
          onClick={() => {
            toggleNavbar();
          }}
        >
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
          {isSignedIn && (
            <li>
              <Link href="/likes">{t("navbar.likes")}</Link>
            </li>
          )}
          <li>
            <Link href="/settings">{t("navbar.settings")}</Link>
          </li>
        </ol>
        {isSignedIn ? (
          <UserButton afterSignOutUrl="/" />
        ) : (
          <div className={styles.authButtonsRow}>
            <LinkButton href="/sign-up" locale={false} variant="secondary">
              {t("actions.signUp")}
            </LinkButton>
            <LinkButton href="/login" locale={false}>
              {t("actions.logIn")}
            </LinkButton>
          </div>
        )}
      </nav>
    </div>
  );
};
