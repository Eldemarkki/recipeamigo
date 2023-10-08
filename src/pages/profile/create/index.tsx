import { Button } from "../../../components/button/Button";
import config from "../../../config";
import type { profilePostHandler } from "../../../handlers/profile/profilePostHandler";
import { useErrors } from "../../../hooks/useErrors";
import { useLoadingState } from "../../../hooks/useLoadingState";
import { getUserFromRequest } from "../../../utils/auth";
import { ErrorCode, getErrorFromResponse } from "../../../utils/errors";
import styles from "./page.module.css";
import type { UserProfile } from "@prisma/client";
import type { GetServerSideProps } from "next";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";
import type { z } from "zod";

const saveProfile = async (
  body: z.infer<typeof profilePostHandler.bodyValidator>,
) => {
  const response = await fetch("/api/profile", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    return getErrorFromResponse(response);
  }

  const data = (await response.json()) as UserProfile;

  return data;
};

export default function CreateProfilePage() {
  const { t } = useTranslation("profile");
  const [profileName, setProfileName] = useState("");
  const { showErrorToast } = useErrors();
  const { isLoading, startLoading, stopLoading } = useLoadingState();

  const router = useRouter();

  return (
    <>
      <Head>
        <title>{`${t("pageTitle")} | ${config.APP_NAME}`}</title>
      </Head>
      <div className={styles.container}>
        <div className={styles.innerContainer}>
          <h1 className={styles.title}>{t("question")}</h1>
          <form
            className={styles.form}
            onSubmit={(e) => {
              e.preventDefault();
              startLoading();
              void (async () => {
                const data = await saveProfile({ name: profileName });

                if ("errorCode" in data) {
                  showErrorToast(data.errorCode);
                  stopLoading();
                  if (data.errorCode === ErrorCode.ProfileAlreadyExists) {
                    setProfileName("");
                  } else if (data.errorCode === ErrorCode.Unauthorized) {
                    void router.push("/login");
                  }
                } else {
                  await router.push("/");
                }
              })();
            }}
          >
            <input
              type="text"
              value={profileName}
              onChange={(e) => {
                setProfileName(e.target.value);
              }}
              placeholder={t("placeholderName")}
              minLength={3}
              maxLength={32}
              pattern="[a-zA-Z0-9_]+"
              required
            />
            <Button type="submit" loading={isLoading}>
              {t("createProfileButton")}
            </Button>
          </form>
        </div>
      </div>
    </>
  );
}

export const getServerSideProps = (async ({ req, locale }) => {
  const user = await getUserFromRequest(req);

  if (user.status === "Unauthorized") {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  if (user.status === "OK") {
    return {
      redirect: {
        destination: "/profile",
        permanent: false,
      },
    };
  }

  return {
    props: {
      ...(await serverSideTranslations(locale ?? "en", ["common", "profile"])),
    },
  };
}) satisfies GetServerSideProps;
