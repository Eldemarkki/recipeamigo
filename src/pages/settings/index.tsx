import ThemeToggle from "../../components/themeToggle/ThemeToggle";
import type { GetServerSideProps } from "next";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

export default function SettingsPage() {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t("settings:settingsTitle")}</h1>
      <ThemeToggle />
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? "en")),
    },
  };
};
