import { Button } from "../../../components/button/Button";
import config from "../../../config";
import type { profilePostHandler } from "../../../handlers/profile/profilePostHandler";
import { getUserFromRequest } from "../../../utils/auth";
import { HttpError, isKnownHttpStatusCode } from "../../../utils/errors";
import styles from "./page.module.css";
import type { UserProfile } from "@prisma/client";
import type { GetServerSideProps } from "next";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";
import toast from "react-hot-toast";
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
    if (isKnownHttpStatusCode(response.status)) {
      const errorObj = (await response.json()) as unknown;
      if (
        typeof errorObj === "object" &&
        errorObj &&
        "message" in errorObj &&
        typeof errorObj.message === "string"
      ) {
        const message = errorObj.message;
        if (
          message === "Username already taken" ||
          message === "Profile already exists" ||
          message === "Not authenticated"
        ) {
          return { message } as const;
        }
      }

      throw new HttpError(response.statusText, response.status);
    } else {
      throw new Error("Error with status " + response.status);
    }
  }

  const data = (await response.json()) as UserProfile;

  return data;
};

export default function CreateProfilePage() {
  const { t } = useTranslation("profile");
  const [profileName, setProfileName] = useState("");

  const router = useRouter();

  return (
    <>
      <Head>
        <title>
          {t("pageTitle")} | {config.APP_NAME}
        </title>
      </Head>
      <div className={styles.container}>
        <div className={styles.innerContainer}>
          <h1 className={styles.title}>{t("question")}</h1>
          <form
            className={styles.form}
            onSubmit={(e) => {
              e.preventDefault();
              void (async () => {
                const data = await saveProfile({ name: profileName });

                if ("message" in data) {
                  switch (data.message) {
                    case "Not authenticated":
                      void router.push("/login");
                      break;
                    case "Profile already exists":
                      setProfileName("");
                      toast.error(t("errors.profileAlreadyExists"));
                      break;
                    case "Username already taken":
                      toast.error(t("errors.usernameAlreadyTaken"));
                      break;
                    default:
                      toast.error(t("errors.unknownError"));
                      break;
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
            <Button type="submit">{t("createProfileButton")}</Button>
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
