import { PageWrapper } from "../../components/misc/PageWrapper";
import ThemeToggle from "../../components/themeToggle/ThemeToggle";
import type { GetServerSideProps } from "next";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

export default function SettingsPage() {
  const { t } = useTranslation();

  return (
    <PageWrapper title={t("settings:settingsTitle")}>
      <ThemeToggle />
    </PageWrapper>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? "en")),
    },
  };
};
