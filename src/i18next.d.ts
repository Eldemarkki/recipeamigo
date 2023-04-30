import enCommon from "../public/locales/en/common.json";
import enHome from "../public/locales/en/home.json";
import enRecipeView from "../public/locales/en/recipeView.json";
import enSettings from "../public/locales/en/settings.json";
import enUserPage from "../public/locales/en/userPage.json";
import enProfile from "../public/locales/en/profile.json";

import fiCommon from "../public/locales/fi/common.json";
import fiHome from "../public/locales/fi/home.json";
import fiRecipeView from "../public/locales/fi/recipeView.json";
import fiSettings from "../public/locales/fi/settings.json";
import fiUserPage from "../public/locales/fi/userPage.json";
import fiProfile from "../public/locales/fi/profile.json";

declare module "i18next" {
  interface CustomTypeOptions {
    resources: {
      common: typeof enCommon | typeof fiCommon;
      home: typeof enHome | typeof fiHome;
      recipeView: typeof enRecipeView | typeof fiRecipeView;
      settings: typeof enSettings | typeof fiSettings;
      userPage: typeof enUserPage | typeof fiUserPage;
      profile: typeof enProfile | typeof fiProfile;
    }
  }
}

export type Locale = "en" | "fi";
