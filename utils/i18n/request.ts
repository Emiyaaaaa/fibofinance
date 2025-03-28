import { getRequestConfig } from "next-intl/server";
import { IntlErrorCode } from "next-intl";

import { getUserLocale } from "./locale";

export default getRequestConfig(async () => {
  const locale = await getUserLocale();

  return {
    locale,
    messages: (await import(`../../i18n/${locale}.json`)).default,
    getMessageFallback({ namespace, key, error }) {
      const path = [namespace, key].filter((part) => part != null).join(".");

      if (error.code === IntlErrorCode.MISSING_MESSAGE) {
        return path + " is not yet translated";
      } else {
        return "Dear developer, please fix this message: " + path;
      }
    },
  };
});
