// Thanks to MrDockal (https://github.com/MrDockal) for this function: https://github.com/i18next/next-i18next/issues/2079#issue-1537887966

// @ts-expect-error
import { createConfig } from "next-i18next/dist/commonjs/config/createConfig";
// @ts-expect-error
import createClient from "next-i18next/dist/commonjs/createClient";
import { i18n as singletonI18n } from "next-i18next";
import nextI18NextConfig from "../../next-i18next.config";

export const getI18nClient = async (
  lng: string,
): Promise<typeof singletonI18n> => {
  if (singletonI18n) {
    return singletonI18n;
  } else {
    const config = createConfig({
      ...nextI18NextConfig,
      lng,
    });
    const { i18n, initPromise } = createClient({ ...config, lng });
    await initPromise;
    return i18n;
  }
};
