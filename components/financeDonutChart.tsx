"use client";

import { useTranslations } from "next-intl";
import { useMemo } from "react";

import { toFixed2 } from "@/utils/exchangeRate";
import useFinanceData from "@/utils/store/useFinanceData";
import { getTotalFinance } from "@/utils/totalFinance";
import { DonutChart } from "./tremor/donutChart";
import { currencyMap, financeTypeColors } from "@/utils";

export default function FinanceDonutChart() {
  const { data: financeData } = useFinanceData();
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

  // 黄金/白银比例
  const chartData2 = useMemo(() => {
    const typeSum: { XAU: number; XAG: number } = {
      XAU: 0,
      XAG: 0,
    };
    financeData.forEach((item) => {
      if (item.currency === "XAU" || item.name.includes("黄金")) {
        typeSum.XAU += getTotalFinance([item], t("defaultCurrency"));
      } else if (item.currency === "XAG" || item.name.includes("白银")) {
        typeSum.XAG += getTotalFinance([item], t("defaultCurrency"));
      }
    });

    return [
      { type: t("XAU"), amount: typeSum.XAU },
      { type: t("XAG"), amount: typeSum.XAG },
    ];
  }, [financeData]);

  if (!financeData.length) {
    return null;
  }

  return (
    <div className="flex gap-4 w-full px-4">
      <DonutChart
        data={chartData1}
        category="type"
        value="amount"
        categoryColors={Object.fromEntries(Object.entries(financeTypeColors).map(([key, value]) => [t(key), value]))}
        valueFormatter={(number: number) =>
          `${currencyMap[t("defaultCurrency") as keyof typeof currencyMap]}${toFixed2(number)}`
        }
      />
      <DonutChart
        data={chartData2}
        category="type"
        value="amount"
        label={t("metal")}
        categoryColors={{
          [t("XAU")]: "gold-200",
          [t("XAG")]: "stone-100",
        }}
        valueFormatter={(number: number) =>
          `${currencyMap[t("defaultCurrency") as keyof typeof currencyMap]}${toFixed2(number)}`
        }
      />
    </div>
  );
}
