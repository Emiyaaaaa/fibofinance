import NumberFlow from "@number-flow/react";
import { Tooltip } from "@heroui/react";
import { getTotalFinance } from "@/utils/totalFinance";
import { toFixed2 } from "@/utils";
import { useTranslations } from "next-intl";
import { useFinanceExchangeRateData } from "@/utils/store/useFinanceExchangeRateData";
import { useCurrencyData } from "@/utils/store/useCurrencyData";
import { useFinanceData } from "@/utils/store/useFinanceData";
import { useFinanceTotalData } from "@/utils/store/useFinanceTotalData";
import useFinanceChangeData from "@/utils/store/useFinanceChangeData";
import { SparkLineChart } from "@/components/tremor/sparkChart";
import { useEffect, useMemo, useState } from "react";
import { Finance, FinanceChange } from "@/types";
import { buildFinanceTrend } from "@/utils/financeTrend";

type FinanceChangeWithData = FinanceChange & {
  financeData: Finance[];
};

export default function FinanceTotal() {
  const { data: financeData } = useFinanceData();
  const { data: totalData } = useFinanceTotalData();
  const { data: changeData } = useFinanceChangeData();
  const { latestRates } = useFinanceExchangeRateData();
  const { currencyMap } = useCurrencyData();
  const t = useTranslations("chart");
  const [showAll, setShowAll] = useState(false);
  const [allChangeData, setAllChangeData] = useState<FinanceChangeWithData[]>([]);
  const defaultCurrency = t("defaultCurrency");

  useEffect(() => {
    let ignore = false;

    fetch("/api/finance/changeData")
      .then(async (res) => {
        if (!res.ok) return [];

        const data: FinanceChange[] = await res.json();

        return data.map((item) => ({
          ...item,
          financeData: JSON.parse(item.finance_json) as Finance[],
        }));
      })
      .then((data) => {
        if (!ignore) {
          setAllChangeData(data);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  const groupAmount = useMemo(() => {
    if (!financeData || !latestRates) return 0;

    return toFixed2(
      getTotalFinance(financeData, defaultCurrency, {
        rates: latestRates,
        useLatestRates: true,
      })
    );
  }, [defaultCurrency, financeData, latestRates]);

  const allAmount = useMemo(() => {
    if (!totalData?.length || !latestRates) return 0;

    return toFixed2(
      getTotalFinance(totalData, defaultCurrency, {
        rates: latestRates,
        useLatestRates: true,
      })
    );
  }, [defaultCurrency, latestRates, totalData]);

  const groupTrendData = useMemo(() => {
    if (!latestRates) return [];

    return buildFinanceTrend(changeData, defaultCurrency);
  }, [changeData, defaultCurrency, latestRates]);

  const allTrendData = useMemo(() => {
    if (!latestRates) return [];

    // 按日期升序聚合：每个日期把各 group 的"最新一份" financeData 累加起来
    const latestFinanceDataByGroup = new Map<number, Finance[]>();
    const dataByDate = [...allChangeData]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .reduce<Record<string, FinanceChangeWithData[]>>((acc, item) => {
        acc[item.date] = [...(acc[item.date] ?? []), item];
        return acc;
      }, {});

    const aggregated = Object.entries(dataByDate).map(([date, items]) => {
      items.forEach((item) => {
        latestFinanceDataByGroup.set(Number(item.group_id), item.financeData);
      });

      return {
        date,
        financeData: [...latestFinanceDataByGroup.values()].flat(),
      };
    });

    return buildFinanceTrend(aggregated, defaultCurrency, {
      rates: latestRates,
      useLatestRates: true,
    });
  }, [allChangeData, defaultCurrency, latestRates]);

  const displayTrendData = showAll ? allTrendData : groupTrendData;
  const displayTrend = displayTrendData.length > 1;

  const displayAmount = showAll ? allAmount : groupAmount;

  if (!displayAmount) return null;

  return (
    <Tooltip content={showAll ? t("switchToGroup") : t("switchToAll")}>
      <div
        className="flex items-center gap-2 cursor-pointer select-none min-w-0"
        style={{ fontFamily: "Rajdhani" }}
        onClick={() => setShowAll((v) => !v)}
      >
        <span className="text-primary text-xl md:text-4xl font-bold shrink-0">
          <NumberFlow
            value={displayAmount}
            prefix={currencyMap[defaultCurrency]?.symbol}
            format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }}
          />
        </span>
        {displayTrend && (
          <SparkLineChart
            data={displayTrendData}
            index="date"
            categories={["total"]}
            colors={["primary"]}
            autoMinValue
            className="py-2 shrink-0"
          />
        )}
      </div>
    </Tooltip>
  );
}
