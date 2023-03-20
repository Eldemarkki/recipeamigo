import dynamic from "next/dynamic";
import { Suspense } from "react";
const HankoAuth = dynamic(() => import("../../components/auth/HankoAuth"), { ssr: false });

export default function Home() {
  return <Suspense fallback="Loading ...">
    <HankoAuth />
  </Suspense >;
}
