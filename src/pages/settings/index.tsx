import { Button } from "../../components/button/Button";
import { LanguageSelector } from "../../components/languageSelector/LanguageSelector";
import { PageWrapper } from "../../components/misc/PageWrapper";
import ThemeToggle from "../../components/themeToggle/ThemeToggle";
import config from "../../config";
import { createPropsLoader } from "../../dataLoaders/loadProps";
import { settingsPageDataLoader } from "../../dataLoaders/settings/settingsPageDataLoader";
import type { profileSchema } from "../../handlers/profile/profilePutHandler";
import { useErrors } from "../../hooks/useErrors";
import { getErrorFromResponse } from "../../utils/errors";
import styles from "./index.module.css";
import type { InferGetServerSidePropsType } from "next";
import { useTranslation } from "next-i18next";
import Head from "next/head";
import { useId, useState } from "react";
import type { z } from "zod";

const saveProfile = async (body: z.infer<typeof profileSchema>) => {
  const response = await fetch("/api/profile", {
    method: "PUT",
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    return getErrorFromResponse(response);
  }
};

export default function SettingsPage(
  props: InferGetServerSidePropsType<typeof getServerSideProps>,
) {
  const { t } = useTranslation(["settings", "common", "profile"]);
  const { showErrorToast } = useErrors();

  const [initialUsername, setInitialUsername] = useState(
    props.username ?? null,
  );
  const [username, setUsername] = useState(initialUsername);

  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  const usernameId = useId();

  return (
    <>
      <Head>
        <title>{`${t("settings:settingsTitle")} | ${config.APP_NAME}`}</title>
      </Head>
      <PageWrapper title={t("settings:settingsTitle")}>
        <div className={styles.container}>
          {username !== null && (
            <>
              <h2>{t("settings:profileTitle")}</h2>
              <form
                className={styles.form}
                onSubmit={(e) => {
                  e.preventDefault();
                  setLoading(true);
                  void (async () => {
                    const error = await saveProfile({ name: username });
                    setInitialUsername(username);

                    setIsSaved(true);
                    setTimeout(() => {
                      setIsSaved(false);
                    }, 3000);

                    if (error) {
                      showErrorToast(error.errorCode);
                    }
                    setLoading(false);
                  })();
                }}
              >
                <div className={styles.username}>
                  <label htmlFor={usernameId}>{t("settings:username")}</label>
                  <input
                    id={usernameId}
                    type="text"
                    placeholder={t("settings:username")}
                    autoComplete="nickname"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                    }}
                    required
                    minLength={config.USERNAME_MIN_LENGTH}
                    maxLength={config.USERNAME_MAX_LENGTH}
                  />
                </div>
                <Button
                  type="submit"
                  disabled={
                    username === initialUsername ||
                    !config.USERNAME_REGEX.test(username) ||
                    isSaved
                  }
                  loading={loading}
                >
                  {isSaved
                    ? t("common:actionResults.saved")
                    : t("common:actions.save")}
                </Button>
              </form>
            </>
          )}
          <h2>{t("settings:preferencesTitle")}</h2>
          <ThemeToggle />
          <LanguageSelector />
        </div>
      </PageWrapper>
    </>
  );
}

export const getServerSideProps = createPropsLoader(settingsPageDataLoader, [
  "common",
  "settings",
  "profile",
]);
