import { LanguageSelector } from "../../components/languageSelector/LanguageSelector";
import { PageWrapper } from "../../components/misc/PageWrapper";
import ThemeToggle from "../../components/themeToggle/ThemeToggle";
import config from "../../config";
import styles from "./index.module.css";
import type { GetServerSideProps } from "next";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Head from "next/head";

export default function SettingsPage() {
  const { t } = useTranslation();

  return (
    <>
      <Head>
        <title>
          {t("settings:settingsTitle")} | {config.APP_NAME}
        </title>
      </Head>
      <PageWrapper title={t("settings:settingsTitle")}>
        <div className={styles.container}>
          <ThemeToggle />
          <LanguageSelector />
        </div>
      </PageWrapper>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? "en")),
    },
  };
};
