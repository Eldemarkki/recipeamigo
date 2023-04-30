import { GetServerSideProps } from "next";
import { getUserFromRequest } from "../../../utils/auth";
import { useState } from "react";
import { UserProfile } from "@prisma/client";
import { useRouter } from "next/router";
import { Button } from "../../../components/button/Button";
import styles from "./page.module.css";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

export type CreateProfilePageProps = {
  userId: string;
}

export default function CreateProfilePage(props: CreateProfilePageProps) {
  const { t } = useTranslation();
  const [profileName, setProfileName] = useState("");

  const router = useRouter();

  const saveProfile = async () => {
    const response = await fetch("/api/profile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: profileName,
      }),
    });

    const data = await response.json() as {
      message: "Not authenticated";
    } | {
      message: "Profile already exists"
    } | {
      message: "Username already taken"
    } | UserProfile;

    if ("message" in data) {
      switch (data.message) {
        case "Not authenticated":
          router.push("/login");
          break;
        case "Profile already exists":
          setProfileName("");
          // TODO: Show better error message
          alert(t("profile:errors.profileAlreadyExists"));
          break;
        case "Username already taken":
          // TODO: Show better error message
          alert(t("errors.usernameAlreadyTaken"));
          break;
        default:
          // TODO: Show better error message
          alert(t("errors.unknownError"));
          break;
      }
    }
    else {
      router.push("/");
    }
  };

  return <div className={styles.container}>
    <div className={styles.innerContainer}>
      <h1>{t("profile:question")}</h1>
      <form
        className={styles.form}
        onSubmit={async (e) => {
          e.preventDefault();
          await saveProfile();
        }}
      >
        <input
          type="text"
          value={profileName}
          onChange={(e) => setProfileName(e.target.value)}
          placeholder={t("profile:placeholderName")}
          minLength={3}
          maxLength={32}
          pattern="[a-zA-Z0-9_]+"
          required
        />
        <Button>{t("profile:createProfileButton")}</Button>
      </form>
    </div>
  </div>;
}

export const getServerSideProps: GetServerSideProps<CreateProfilePageProps> = async ({ req, locale }) => {
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
      ...(await serverSideTranslations(locale ?? "en")),
      userId: user.userId,
    },
  };
};
