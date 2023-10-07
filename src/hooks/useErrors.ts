import type { ErrorCode } from "../utils/errors";
import type { Locale } from "../utils/stringUtils";
import { useTranslation } from "next-i18next";
import toast from "react-hot-toast";

const errors = {
  en: {
    BAD_REQUEST: "Bad request",
    UNAUTHORIZED: "Not authenticated",
    COLLECTION_NOT_FOUND: "Collection not found",
    RECIPE_NOT_FOUND: "Recipe not found",
    CANNOT_LIKE_OWN_RECIPE: "Cannot like own recipe",
    CANNOT_UNLIKE_OWN_RECIPE: "Cannot unlike own recipe",
    INGREDIENTS_NOT_FOUND: "Ingredients not found",
    INSTRUCTIONS_NOT_FOUND: "Instructions not found",
    RECIPE_ALREADY_LIKED: "Recipe already liked",
    RECIPE_ALREADY_UNLIKED: "Recipe already unliked",
    UNKNOWN: "Unknown error",
    INTERNAL_SERVER_ERROR: "Internal server error",
    INVALID_QUERY_PARAMETERS: "Invalid query parameters",
    USERNAME_ALREADY_TAKEN: "Username already taken",
    USER_NOT_FOUND: "User not found",
    RECIPES_NOT_FOUND: "Recipes not found",
    RECIPES_MUST_BE_PUBLIC: "Recipes must be public",
    RECIPES_MUST_BE_PUBLIC_OR_UNLISTED: "Recipes must be public or unlisted",
    PROFILE_ALREADY_EXISTS: "Profile already exists",
    INGREDIENT_SECTIONS_NOT_FOUND: "Ingredient sections not found",
    CANNOT_ADD_RECIPE_TO_COLLECTIONS_NO_WRITE_ACCESS:
      "You don't have write access to one or more of the collections",
    CANNOT_ADD_RECIPE_TO_COLLECTIONS_INVALID_VISIBILITY:
      "Invalid visibility configuration",
    CANNOT_ADD_RECIPE_TO_COLLECTIONS_DONT_EXIST_OR_NO_READ_ACCESS:
      "The collections don't exist or you don't have read access to them",
  },
  fi: {
    BAD_REQUEST: "Virheellinen pyyntö",
    UNAUTHORIZED: "Et ole kirjautunut sisään",
    COLLECTION_NOT_FOUND: "Kokoelmaa ei löytynyt",
    RECIPE_NOT_FOUND: "Reseptiä ei löytynyt",
    CANNOT_LIKE_OWN_RECIPE: "Et voi tykätä omasta reseptistäsi",
    CANNOT_UNLIKE_OWN_RECIPE: "Et voi poistaa tykkäystä omasta reseptistäsi",
    INGREDIENTS_NOT_FOUND: "Ainesosia ei löytynyt",
    INSTRUCTIONS_NOT_FOUND: "Ohjeita ei löytynyt",
    RECIPE_ALREADY_LIKED: "Olet jo tykännyt tästä reseptistä",
    RECIPE_ALREADY_UNLIKED: "Et ole vielä tykännyt tästä reseptistä",
    UNKNOWN: "Tuntematon virhe",
    INTERNAL_SERVER_ERROR: "Palvelimella tapahtui virhe",
    INVALID_QUERY_PARAMETERS: "Virheelliset kyselyparametrit",
    USERNAME_ALREADY_TAKEN: "Käyttäjänimi on jo varattu",
    USER_NOT_FOUND: "Käyttäjää ei löytynyt",
    RECIPES_NOT_FOUND: "Reseptejä ei löytynyt",
    RECIPES_MUST_BE_PUBLIC: "Reseptien tulee olla julkisia",
    RECIPES_MUST_BE_PUBLIC_OR_UNLISTED:
      "Reseptien tulee olla julkisia tai piilotettuja",
    PROFILE_ALREADY_EXISTS: "Profiili on jo olemassa",
    INGREDIENT_SECTIONS_NOT_FOUND: "Ainesosien osioita ei löytynyt",
    CANNOT_ADD_RECIPE_TO_COLLECTIONS_NO_WRITE_ACCESS:
      "Sinulla ei ole kirjoitusoikeuksia yhteen tai useampaan kokoelmaan",
    CANNOT_ADD_RECIPE_TO_COLLECTIONS_INVALID_VISIBILITY:
      "Virheellinen näkyvyysasettelu",
    CANNOT_ADD_RECIPE_TO_COLLECTIONS_DONT_EXIST_OR_NO_READ_ACCESS:
      "Kokoelmia ei ole olemassa tai sinulla ei ole lukuoikeuksia niihin",
  },
} satisfies Record<Locale, Record<ErrorCode, string>>;

export const useErrors = () => {
  const { i18n } = useTranslation();

  const getErrorMessage = (error: ErrorCode) => {
    return errors[i18n.resolvedLanguage as Locale][error];
  };

  return {
    showErrorToast: (error: ErrorCode) => {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
    },
    getErrorMessage,
  };
};
