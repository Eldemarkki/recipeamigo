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
    props: {},
  };
};
