import "next-intl";
import i18nJson from "@/i18n/zh.json";

type Messages = typeof i18nJson;

declare module "next-intl" {
  declare global {
    // Use type safe message keys with `next-intl`
    interface IntlMessages extends Messages {}
  }
}
