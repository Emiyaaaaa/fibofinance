"use client";

import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { Card, CardHeader, CardBody } from "@heroui/card";
import { Divider } from "@heroui/divider";
import { Switch } from "@heroui/switch";

import AmountOffset from "./amountOffset";

import { LineChart, TooltipProps } from "@/components/tremor/lineChart";
import { subAmount } from "@/utils/exchangeRate";
import useFinanceChangeData, { FinanceChangeData } from "@/utils/store/useFinanceChangeData";
import { currencyMap } from "@/utils";
import { getBetweenDateLength } from "@/utils/dateRange";
import { Finance } from "@/types";
import useFinanceData from "@/utils/store/useFinanceData";
import { getTotalFinance } from "@/utils/totalFinance";

type FinanceChangeChartData = FinanceChangeData & {
  total: number;
};

interface FinanceChartData {
  date: string;
  total?: number;
  item?: FinanceChangeChartData;
  lastItem?: FinanceChangeChartData;
}

function CustomTooltip(props: TooltipProps) {
  const t = useTranslations("chart");

  const { date, total, item, lastItem: _lastItem } = (props.payload?.[0]?.payload ?? {}) as FinanceChartData;

  if (!item) {
    return null;
  }

  if (!item?.financeData?.length) {
    return null;
  }

  const activePayload = props.activePayload as FinanceChartData | undefined;

  const lastItem = activePayload?.item ?? _lastItem;

  const hasActiveItem = !!activePayload;

  const lastFinanceData = lastItem?.financeData;
  const currentFinanceData = item.financeData;

  const financeList: (Finance & { offset?: number })[] = [];

  currentFinanceData.forEach((item) => {
    if (!lastFinanceData) {
      financeList.push(item);

      return;
    }

    const lastFinance = lastFinanceData?.find((f) => f.id === item.id);

    if (lastFinance) {
      financeList.push({
        ...item,
        offset: subAmount(item, lastFinance, item.currency),
      });
    } else {
      financeList.push({
        ...item,
        offset: item.amount,
      });
    }
  });

  lastFinanceData?.forEach((item) => {
    if (!financeList.find((f) => f.id === item.id)) {
      financeList.push({
        ...item,
        amount: 0,
        offset: -item.amount,
      });
    }
  });

  const totalOffset = lastItem ? item.total - lastItem.total : 0;

  return (
    <Card className="border-primary border-1 border-solid border-opacity-80" shadow="lg">
      {hasActiveItem && (
        <div className="bg-primary text-black">
          <div className="flex items-center justify-center p-[6px]">
            <div className="text-xs font-bold">{t("diffWith") + " " + lastItem?.date}</div>
          </div>
        </div>
      )}
      <CardHeader className="flex items-start justify-between">
        <div>
          <div className="text-primary font-bold text-base">{`${currencyMap[t("defaultCurrency") as keyof typeof currencyMap]}${total}`}</div>
          <AmountOffset className="text-xs" currency={t("defaultCurrency")} offset={totalOffset} />
        </div>
        <div className="ml-3 bg-white bg-opacity-10 text-xs py-1 px-[6px] rounded">{date}</div>
      </CardHeader>
      <Divider />
      <CardBody className="flex flex-col gap-2 text-xs">
        {financeList.map((item) => (
          <div key={item.id} className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full" />
              {item.name}
            </div>
            <div className="pl-2 flex flex-col items-end">
              <div className="text-primary">{`${currencyMap[item.currency]}${item.amount}`}</div>
              <AmountOffset currency={item.currency} offset={item.offset} />
            </div>
          </div>
        ))}
      </CardBody>
    </Card>
  );
}

export default function FinanceChart() {
  const t = useTranslations("chart");

  const { data: changeData } = useFinanceChangeData();
  const { data: financeData } = useFinanceData();
  const [showUnCount, setShowUnCount] = useState(false);

  const chartdata = useMemo(() => {
    const data: FinanceChartData[] = [];

    const ignoreInTotalFinanceId = showUnCount
      ? []
      : financeData.filter((item) => item.not_count).map((item) => item.id);

    // 数据去重
    const uniqueChangeData: FinanceChangeChartData[] = [];

    changeData.forEach((item, index) => {
      const financeData = item.financeData.filter((item) => !ignoreInTotalFinanceId.includes(item.id));
      const lastFinanceData = changeData[index - 1]?.financeData.filter(
        (item) => !ignoreInTotalFinanceId.includes(item.id),
      );

      const total = getTotalFinance(financeData, t("defaultCurrency"));
      const lastTotal = lastFinanceData ? getTotalFinance(lastFinanceData, t("defaultCurrency")) : 0;

      if (total === lastTotal) {
        return;
      }

      uniqueChangeData.push({ ...item, total });
    });

    uniqueChangeData.forEach((item, index) => {
      const lastItem = uniqueChangeData[index - 1];

      const lastDate = lastItem?.date;

      if (lastDate) {
        const lastDateLength = getBetweenDateLength(new Date(lastDate), new Date(item.date));

        // 插入空数据保证数据间隔合理
        for (let i = 0; i < lastDateLength; i++) {
          const date = new Date(lastDate);

          date.setDate(date.getDate() + i);

          data.push({
            date: date.toLocaleDateString(),
          });
        }
      }

      data.push({
        date: item.date,
        total: item.total,
        item: {
          ...item,
          financeData: item.financeData.filter((item) => !ignoreInTotalFinanceId.includes(item.id)),
        },
        lastItem: lastItem
          ? {
              ...lastItem,
              financeData: lastItem.financeData.filter((item) => !ignoreInTotalFinanceId.includes(item.id)),
            }
          : undefined,
      });
    });

    return data;
  }, [changeData, financeData, showUnCount, t]);

  const minValue = useMemo(() => {
    const totalList = chartdata
      .filter((chartItem) => chartItem.item?.total !== undefined)
      .map((chartItem) => chartItem.item!.total!);

    const maxValue = Math.max(...totalList);
    const minValue = Math.min(...totalList);

    if (!maxValue || !minValue) {
      return 0;
    }

    return Math.max(minValue - (maxValue - minValue), 0);
  }, [chartdata]);

  if (!chartdata.length) {
    return null;
  }

  return (
    <div className="relative w-full px-4">
      <div className="flex items-center gap-2 my-4">
        <Switch color="primary" isSelected={showUnCount} size="sm" onValueChange={setShowUnCount}>
          <div className="text-xs opacity-70">{t("showUnCount")}</div>
        </Switch>
      </div>
      <LineChart
        clickable
        connectNulls
        showDots
        startEndOnly
        categories={["total"]}
        className="h-80"
        colors={["primary"]}
        customTooltip={CustomTooltip}
        data={chartdata}
        index="date"
        minValue={minValue}
        showLegend={false}
        type="linear"
      />
    </div>
  );
}
