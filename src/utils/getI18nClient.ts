import nextI18NextConfig from "../../next-i18next.config";
import { i18n as singletonI18n } from "next-i18next";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import { createConfig } from "next-i18next/dist/commonjs/config/createConfig";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import createClient from "next-i18next/dist/commonjs/createClient";

// Thanks to MrDockal (https://github.com/MrDockal) for this function: https://github.com/i18next/next-i18next/issues/2079#issue-1537887966
export const getI18nClient = async (
  lng: string,
): Promise<typeof singletonI18n> => {
  if (singletonI18n) {
    return singletonI18n;
  } else {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
    const config = createConfig({
      ...nextI18NextConfig,
      lng,
    });
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    const { i18n, initPromise } = createClient({ ...config, lng });
    await initPromise;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return i18n;
  }
};
