"use client";

import { useTranslations } from "next-intl";
import { useMemo } from "react";

import { toFixed2 } from "@/utils/exchangeRate";
import useFinanceData from "@/utils/store/useFinanceData";
import { getTotalFinance } from "@/utils/totalFinance";
import { DonutChart } from "./tremor/donutChart";
import { financeTypeColors } from "@/utils";
import { useCurrencyData } from "@/utils/store/useCurrencyData";

export default function FinanceDonutChart() {
  const { data: financeData } = useFinanceData();
  const { currencyMap } = useCurrencyData();
  const t = useTranslations("finance");

  // 按currency分类，累加金额
  const chartData1 = useMemo(() => {
    const typeSum: Record<string, number> = {};
    financeData.forEach((item) => {
      const c = item.type ?? "other";
      // 使用amount字段
      if (!typeSum[c]) typeSum[c] = 0;
      typeSum[c] += getTotalFinance([item], t("defaultCurrency"));
    });
    return Object.entries(typeSum).map(([type, amount]) => ({ type: t(type), amount }));
  }, [financeData, t]);

  if (!financeData.length) {
    return null;
  }

  const defaultCurrencySymbol = currencyMap[t("defaultCurrency")]?.symbol || t("defaultCurrency");

  return (
    <div className="flex gap-4 w-full px-4">
      <DonutChart
        data={chartData1}
        category="type"
        value="amount"
        categoryColors={Object.fromEntries(Object.entries(financeTypeColors).map(([key, value]) => [t(key), value]))}
        valueFormatter={(number: number) => `${defaultCurrencySymbol}${toFixed2(number)}`}
      />
    </div>
  );
}
