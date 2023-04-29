import enCommon from "../public/locales/en/common.json";
import enHome from "../public/locales/en/home.json";
import fiCommon from "../public/locales/fi/common.json";
import fiHome from "../public/locales/fi/home.json";

declare module "i18next" {
  interface CustomTypeOptions {
    resources: {
      common: typeof enCommon | typeof fiCommon;
      home: typeof enHome | typeof fiHome;
    }
  }
}

export type Locale = "en" | "fi";
