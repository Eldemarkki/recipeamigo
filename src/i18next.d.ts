import type en404Page from "../public/locales/en/404.json";
import type en500Page from "../public/locales/en/500.json";
import type enBrowse from "../public/locales/en/browse.json";
import type enCollections from "../public/locales/en/collections.json";
import type enCommon from "../public/locales/en/common.json";
import type enHome from "../public/locales/en/home.json";
import type enLikes from "../public/locales/en/likes.json";
import type enProfile from "../public/locales/en/profile.json";
import type enRecipeView from "../public/locales/en/recipeView.json";
import type enSettings from "../public/locales/en/settings.json";
import type enTags from "../public/locales/en/tags.json";
import type enUnits from "../public/locales/en/units.json";
import type enUserPage from "../public/locales/en/userPage.json";
import type fi404Page from "../public/locales/fi/404.json";
import type fi500Page from "../public/locales/fi/500.json";
import type fiBrowse from "../public/locales/fi/browse.json";
import type fiCollections from "../public/locales/fi/collections.json";
import type fiCommon from "../public/locales/fi/common.json";
import type fiHome from "../public/locales/fi/home.json";
import type fiLikes from "../public/locales/fi/likes.json";
import type fiProfile from "../public/locales/fi/profile.json";
import type fiRecipeView from "../public/locales/fi/recipeView.json";
import type fiSettings from "../public/locales/fi/settings.json";
import type fiTags from "../public/locales/fi/tags.json";
import type fiUnits from "../public/locales/fi/units.json";
import type fiUserPage from "../public/locales/fi/userPage.json";

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
      likes: typeof enLikes | typeof fiLikes;
      "404": typeof en404Page | typeof fi404Page;
      "500": typeof en500Page | typeof fi500Page;
    };
  }
}

export type Locale = "en" | "fi";
