import enCommon from "../public/locales/en/common.json";
import enHome from "../public/locales/en/home.json";
import enRecipeView from "../public/locales/en/recipeView.json";
import fiCommon from "../public/locales/fi/common.json";
import fiHome from "../public/locales/fi/home.json";
import fiRecipeView from "../public/locales/fi/recipeView.json";

declare module "i18next" {
  interface CustomTypeOptions {
    resources: {
      common: typeof enCommon | typeof fiCommon;
      home: typeof enHome | typeof fiHome;
      recipeView: typeof enRecipeView | typeof fiRecipeView;
    }
  }
}

export type Locale = "en" | "fi";
