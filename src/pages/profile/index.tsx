import { Suspense } from "react";
import dynamic from "next/dynamic";
import { getUserIdFromRequest } from "../../utils/auth";
import { GetServerSideProps } from "next";

export default function ProfilePage() {
  const HankoProfile = dynamic(() => import("../../components/auth/HankoProfile"), { ssr: false });

  return <Suspense fallback="Loading...">
    <HankoProfile />
  </Suspense>;
};

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const userId = await getUserIdFromRequest(req);

  if (!userId) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
};
