import { register } from "@teamhanko/hanko-elements";
import { useCallback, useEffect } from "react";
import config from "../../config";
import { useRouter } from "next/router";

export default function HankoAuth() {
  const router = useRouter();

  const redirectAfterLogin = useCallback(() => {
    router.replace("/");
  }, [router]);

  useEffect(() => {
    document.addEventListener("hankoAuthSuccess", redirectAfterLogin);
    return () => document.removeEventListener("hankoAuthSuccess", redirectAfterLogin);
  }, [redirectAfterLogin]);

  useEffect(() => {
    register({ shadow: true })
      .catch(console.error);
  }, []);

  return <hanko-auth api={config.HANKO_URL} />;
}
