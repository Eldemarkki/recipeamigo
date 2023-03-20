import { Suspense } from "react";
import dynamic from "next/dynamic";
const HankoProfile = dynamic(() => import("../../components/auth/HankoProfile"), { ssr: false });

export default function ProfilePage() {
  return <Suspense fallback="Loading...">
    <HankoProfile />
  </Suspense>;
};
