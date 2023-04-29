import enHome from "../public/locales/en/home.json";
import fiHome from "../public/locales/fi/home.json";

declare module "i18next" {
  interface CustomTypeOptions {
    resources: {
      home: typeof enHome | typeof fiHome;
    }
  }
}

export type Locale = "en" | "fi";
