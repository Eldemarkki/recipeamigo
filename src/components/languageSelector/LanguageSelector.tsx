import type { Locale } from "../../i18next";
import { isLocale } from "../../utils/stringUtils";
import { Select } from "../Select";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { useId } from "react";

export const LanguageSelector = () => {
  const { t, i18n } = useTranslation("settings");
  const router = useRouter();

  const selectedLocale = isLocale(i18n.language) ? i18n.language : "en";

  const labels = {
    en: t("language.en"),
    fi: t("language.fi"),
  } as const;

  const options = [
    {
      label: labels.en,
      value: "en",
    },
    {
      label: labels.fi,
      value: "fi",
    },
  ] as const;

  const onChangeLocale = (newLocale: Locale) => {
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
    void router.push("/settings", "/settings", { locale: newLocale });
  };

  const id = useId();

  return (
    <div>
      <label htmlFor={id}>{t("language.languageTitle")}</label>
      <Select
        inputId={id}
        value={{
          label: labels[selectedLocale],
          value: selectedLocale,
        }}
        options={options}
        onChange={(value) => {
          onChangeLocale(value?.value as Locale);
        }}
      />
    </div>
  );
};
