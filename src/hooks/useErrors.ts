import { HttpError, type HttpStatusCode } from "../utils/errors";
import type { TFunction } from "i18next";
import { useTranslation } from "next-i18next";
import toast from "react-hot-toast";

export const generateBaseErrors = (t: TFunction<"errors">) => ({
  400: t("common.400"),
  401: t("common.401"),
  403: t("common.403"),
  404: t("common.404"),
  409: t("common.409"),
  500: t("common.500"),
});

export const useErrors = () => {
  const { t } = useTranslation("errors");

  const getErrorMessage = (
    error: unknown,
    overrideMessages?: Partial<Record<HttpStatusCode, string>>,
  ) => {
    if (error instanceof HttpError) {
      const errorMessage = {
        ...generateBaseErrors(t),
        ...overrideMessages,
      }[error.status];

      return errorMessage;
    } else {
      return t("common.unknownError");
    }
  };

  return {
    showErrorToast: (
      error: unknown,
      overrideMessages?: Partial<Record<HttpStatusCode, string>>,
    ) => {
      const errorMessage = getErrorMessage(error, overrideMessages);
      toast.error(errorMessage);
    },
    getErrorMessage,
  };
};
