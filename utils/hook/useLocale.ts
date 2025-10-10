import { create } from "zustand";
import { Locale } from "../i18n/config";

type LocaleStore = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
};

export const useLocale = create<LocaleStore>((set) => ({
  locale: "en",
  setLocale: (locale: Locale) => set({ locale }),
}));
