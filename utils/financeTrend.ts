import { Finance } from "@/types";

import { toFixed2 } from "./exchangeRate";
import { getTotalFinance } from "./totalFinance";

export type FinanceTrendOptions = {
  rates?: Record<string, number>;
  useLatestRates?: boolean;
};

/**
 * 把按时间顺序排列的 finance 变动数据转换为带 `total` 的趋势点序列，
 * 并对相邻、相同 total 的数据点做去重（保留先出现的那个）。
 *
 * 同时被 LineChart（详细图表）和 SparkLineChart（顶部小趋势图）使用，
 * 保证两者的总额计算和去重口径完全一致。
 */
export function buildFinanceTrend<T extends { financeData: Finance[] }>(
  data: T[],
  currency: string,
  options: FinanceTrendOptions = {}
): Array<T & { total: number }> {
  return data
    .map((item) => ({
      ...item,
      total: toFixed2(getTotalFinance(item.financeData, currency, options)),
    }))
    .filter((item, index, arr) => item.total !== arr[index - 1]?.total);
}
