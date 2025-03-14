export type Locale = (typeof locales)[number];

export const locales = ["en", "zh"] as const;
export const localeLabels = {
  en: "EN",
  zh: "中文",
} as const;
export const localeList = Object.entries(localeLabels).map(([key, label]) => ({
  key,
  label,
})) as { key: Locale; label: string }[];
export const defaultLocale: Locale = "en";
