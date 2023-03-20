import dynamic from "next/dynamic";
import { Suspense } from "react";

export default function Home() {
  const HankoAuth = dynamic(() => import("../../components/auth/HankoAuth"), { ssr: false });

  return <Suspense fallback="Loading...">
    <HankoAuth />
  </Suspense >;
}
