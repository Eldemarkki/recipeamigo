import { Suspense } from "react";
import dynamic from "next/dynamic";
import { getUserFromRequest } from "../../utils/auth";
import { GetServerSideProps } from "next";

export default function ProfilePage() {
  const HankoProfile = dynamic(() => import("../../components/auth/HankoProfile"), { ssr: false });

  return <Suspense fallback="Loading...">
    <HankoProfile />
  </Suspense>;
};

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const user = await getUserFromRequest(req);

  if (!user) {
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
