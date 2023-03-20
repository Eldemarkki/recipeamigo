import { useEffect } from "react";
import { register } from "@teamhanko/hanko-elements";
import config from "../../config";

export default function HankoProfile() {
  useEffect(() => {
    register({ shadow: true })
      .catch(console.error);
  }, []);

  return <hanko-profile api={config.HANKO_URL} />;
};
