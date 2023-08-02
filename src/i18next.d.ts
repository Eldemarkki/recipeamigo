import enBrowse from "../public/locales/en/browse.json";
import enCollections from "../public/locales/en/collections.json";
import enCommon from "../public/locales/en/common.json";
import enHome from "../public/locales/en/home.json";
import enProfile from "../public/locales/en/profile.json";
import enRecipeView from "../public/locales/en/recipeView.json";
import enSettings from "../public/locales/en/settings.json";
import enTags from "../public/locales/en/tags.json";
import enUnits from "../public/locales/en/units.json";
import enUserPage from "../public/locales/en/userPage.json";
import fiBrowse from "../public/locales/fi/browse.json";
import fiCollections from "../public/locales/fi/collections.json";
import fiCommon from "../public/locales/fi/common.json";
import fiHome from "../public/locales/fi/home.json";
import fiProfile from "../public/locales/fi/profile.json";
import fiRecipeView from "../public/locales/fi/recipeView.json";
import fiSettings from "../public/locales/fi/settings.json";
import fiTags from "../public/locales/fi/tags.json";
import fiUnits from "../public/locales/fi/units.json";
import fiUserPage from "../public/locales/fi/userPage.json";

declare module "i18next" {
  interface CustomTypeOptions {
    resources: {
      common: typeof enCommon | typeof fiCommon;
      home: typeof enHome | typeof fiHome;
      recipeView: typeof enRecipeView | typeof fiRecipeView;
      settings: typeof enSettings | typeof fiSettings;
      userPage: typeof enUserPage | typeof fiUserPage;
      profile: typeof enProfile | typeof fiProfile;
      tags: typeof enTags | typeof fiTags;
      units: typeof enUnits | typeof fiUnits;
      browse: typeof enBrowse | typeof fiBrowse;
      collections: typeof enCollections | typeof fiCollections;
    };
  }
}

export type Locale = "en" | "fi";
