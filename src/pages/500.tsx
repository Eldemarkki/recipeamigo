import config from "../config";
import styles from "./errorPage.module.css";
import type { GetStaticProps } from "next";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Head from "next/head";

export default function NotFoundPage() {
  const { t } = useTranslation("500");

  return (
    <>
      <Head>
        <title>{`${t("title")} | ${config.APP_NAME}`}</title>
      </Head>
      <div className={styles.page}>
        <h1 className={styles.title}>{t("title")}</h1>
        <p className={styles.description}>{t("description")}</p>
      </div>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? "en", ["common", "500"])),
  },
});
