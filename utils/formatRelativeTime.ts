import { useTranslations } from "next-intl";
import { useCallback } from "react";
import { transformDate } from "./transformDate";

/**
 * 格式化相对时间的 Hook（支持国际化）
 * @returns 一个接收 Date 参数并返回格式化后字符串的函数
 */
export function useFormatRelativeTime() {
  const t = useTranslations("relativeTime");

  return useCallback(
    (date: Date): string => {
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const diffWeeks = Math.floor(diffDays / 7);

      if (diffMinutes < 3) {
        return t("now");
      }

      if (diffMinutes < 60) {
        return t("minutesAgo", { count: diffMinutes });
      }

      if (diffHours < 24) {
        return t("hoursAgo", { count: diffHours });
      }

      if (diffDays === 1) {
        return t("yesterday");
      }

      if (diffDays < 7) {
        return t("daysAgo", { count: diffDays });
      }

      if (diffDays < 14) {
        return t("lastWeek");
      }

      if (diffDays < 30) {
        return t("weeksAgo", { count: diffWeeks });
      }

      if (diffDays < 60) {
        return t("lastMonth");
      }

      return transformDate(date, "YYYY-MM-DD");
    },
    [t]
  );
}
