import HeroImage from "../../public/undraw_cooking.svg";
import { LinkButton } from "../components/LinkButton";
import { RecipeCardGrid } from "../components/RecipeCardGrid";
import { PageWrapper } from "../components/misc/PageWrapper";
import config from "../config";
import { getAllRecipesForUser } from "../database/recipes";
import type { Locale } from "../i18next";
import { getUserFromRequest } from "../utils/auth";
import styles from "./page.module.css";
import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Head from "next/head";
import Image from "next/image";

const locales: Record<Locale, string> = {
  en: "en_US",
  fi: "fi_FI",
};

export default function Home(
  props: InferGetServerSidePropsType<typeof getServerSideProps>,
) {
  const { t, i18n } = useTranslation("home");

  if (!props.loggedIn) {
    return (
      <>
        <Head>
          <title>{config.APP_NAME}</title>
          <meta property="og:title" content={config.APP_NAME} />
          <meta property="og:type" content="website" />
          <meta
            property="og:locale"
            content={locales[i18n.language as Locale]}
          />
          <meta property="og:description" content={t("metaTags.description")} />
          <meta name="description" content={t("metaTags.description")} />
          <meta property="og:site_name" content={config.APP_NAME} />
        </Head>
        <PageWrapper mainClass={styles.main}>
          <div className={styles.landingContainer}>
            <div className={styles.landingLeft}>
              <span className={styles.tagline}>{t("landing.tagline")}</span>
              <span className={styles.subTagline}>
                {t("landing.subTagline")}
              </span>
              <LinkButton href="/sign-up" style={{ width: "fit-content" }}>
                {t("landing.getStartedButton")}
              </LinkButton>
            </div>
            <Image
              // Image from https://undraw.co/ with name "Cooking"
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              src={HeroImage}
              alt={t("landing.heroImageAlt")}
              className={styles.heroImage}
            />
          </div>
        </PageWrapper>
      </>
    );
  } else {
    return (
      <>
        <Head>
          <title>{`${t("pageTitle")} | ${config.APP_NAME}`}</title>
        </Head>
        <PageWrapper
          titleRow={
            <div className={styles.recipesTitleRow}>
              <h1>{t("myRecipes")}</h1>
              <div className={styles.recipesTitleRowButtonContainer}>
                <LinkButton href="/recipe/new">
                  {t("newRecipeButton")}
                </LinkButton>
                <LinkButton href="/collections/new" variant="secondary">
                  {t("newCollectionButton")}
                </LinkButton>
              </div>
            </div>
          }
        >
          <RecipeCardGrid showCreateButton recipes={props.recipes} />
        </PageWrapper>
      </>
    );
  }
}

export const getServerSideProps = (async ({ req, locale }) => {
  const user = await getUserFromRequest(req);

  if (user.status === "No profile") {
    return {
      redirect: {
        destination: "/profile/create",
        permanent: false,
      },
    };
  }

  const userId = user.status === "OK" ? user.userId : undefined;

  const data = userId
    ? ({
        loggedIn: true,
        recipes: await getAllRecipesForUser(userId),
        ...(await serverSideTranslations(locale ?? "en")),
      } as const)
    : ({
        loggedIn: false,
        ...(await serverSideTranslations(locale ?? "en")),
      } as const);

  return {
    props: {
      ...data,
    },
  };
}) satisfies GetServerSideProps;
