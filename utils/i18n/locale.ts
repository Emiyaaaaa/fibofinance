"use server";

import { cookies, headers } from "next/headers";

import { Locale, defaultLocale, locales } from "./config";

const COOKIE_NAME = "NEXT_LOCALE";

export async function getUserLocale(): Promise<Locale> {
  const [localFromCookie, localFromHeader] = await Promise.all([
    (await cookies()).get(COOKIE_NAME)?.value.split("-")[0] as Locale,
    (await headers())
      .get("accept-language")
      ?.split(",")[0]
      .split("-")[0] as Locale,
  ]);

  const local = localFromCookie || localFromHeader || defaultLocale;

  if (!locales.includes(local)) {
    return defaultLocale;
  }

  return local;
}

export async function setUserLocale(locale: Locale) {
  (await cookies()).set(COOKIE_NAME, locale);
}
