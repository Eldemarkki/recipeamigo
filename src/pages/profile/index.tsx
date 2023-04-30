import { Suspense } from "react";
import dynamic from "next/dynamic";
import { getUserFromRequest } from "../../utils/auth";
import { GetServerSideProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

export default function ProfilePage() {
  const HankoProfile = dynamic(() => import("../../components/auth/HankoProfile"), { ssr: false });

  return <Suspense fallback="Loading...">
    <HankoProfile />
  </Suspense>;
};

export const getServerSideProps: GetServerSideProps = async ({ req, locale }) => {
  const user = await getUserFromRequest(req);

  if (user.status === "Unauthorized") {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  if (user.status === "No profile") {
    return {
      redirect: {
        destination: "/profile/create",
        permanent: false,
      },
    };
  }

  return {
    props: {
      ...(await serverSideTranslations(locale ?? "en"))
    },
  };
};
