import { transformDate } from "./transformDate";

/**
 * 格式化相对时间
 * @param date 要格式化的日期
 * @returns 格式化后的相对时间字符串
 */
export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffWeeks = Math.floor(diffDays / 7);

  // 3分钟内 - 显示"现在"
  if (diffMinutes < 3) {
    return "现在";
  }

  // 3分钟到1小时 - 显示"xx分钟前"
  if (diffMinutes < 60) {
    return `${diffMinutes}分钟前`;
  }

  // 1小时到24小时 - 显示"xx小时前"
  if (diffHours < 24) {
    return `${diffHours}小时前`;
  }

  // 昨天（1天到2天）
  if (diffDays === 1) {
    return "昨天";
  }

  // 2天到7天 - 显示"xx天前"
  if (diffDays < 7) {
    return `${diffDays}天前`;
  }

  // 7天到14天 - 显示"上周"
  if (diffDays < 14) {
    return "上周";
  }

  // 14天到30天 - 显示"xx周前"
  if (diffDays < 30) {
    return `${diffWeeks}周前`;
  }

  // 30天到60天 - 显示"上个月"
  if (diffDays < 60) {
    return "上个月";
  }

  // 更远的时间 - 显示具体日期时间
  return transformDate(date, "YYYY-MM-DD HH:mm");
}
