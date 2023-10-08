import config from "../../config";
import styles from "./page.module.css";
import { SignUp } from "@clerk/nextjs";
import type { GetServerSideProps } from "next";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Head from "next/head";

// Currently the app name is "Recipeamigo" and the "Recipe" part should have a gradient.
// If/when the app name is changed, the styling part will have to be reconsidered, so this
// function will remind us to do that.
const ensureAppNameStyle = () => {
  const appName = config.APP_NAME;
  const appNameFirst = appName.slice(0, 6);
  if (appNameFirst !== "Recipe")
    throw new Error("Noncritical: Update login title");
  const appNameSecond = appName.slice(6);
  if (appNameSecond !== "amigo")
    throw new Error("Noncritical: Update login title");

  return { appNameFirst, appNameSecond };
};

export default function Home() {
  const { appNameFirst, appNameSecond } = ensureAppNameStyle();
  const { t } = useTranslation("common");

  return (
    <>
      <Head>
        <title>{`${t("pageTitles.signUp")} | ${config.APP_NAME}`}</title>
      </Head>
      <div className={styles.container}>
        <div className={styles.innerContainer}>
          <h1 className={styles.title}>
            <span className={styles.titleGradientPart}>{appNameFirst}</span>
            <span>{appNameSecond}</span>
          </h1>
          <SignUp />
        </div>
      </div>
    </>
  );
}

export const getServerSideProps = (async (ctx) => ({
  props: {
    ...(await serverSideTranslations(ctx.locale ?? "en", ["common"])),
  },
})) satisfies GetServerSideProps;
