"use client";

import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { Card, CardHeader, CardBody } from "@heroui/card";
import { Divider } from "@heroui/divider";

import AmountOffset from "./amountOffset";

import { LineChart, TooltipProps } from "@/components/tremor/lineChart";
import { convertCurrency, subAmount } from "@/utils/exchangeRate";
import useFinanceChangeData, { FinanceChangeData } from "@/utils/store/useFinanceChangeData";
import { currencyMap } from "@/utils";
import { getBetweenDateLength } from "@/utils/dateRange";
import { Finance } from "@/types";

interface FinanceChartData {
  date: string;
  total?: number;
  item?: FinanceChangeData;
  lastItem?: FinanceChangeData;
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

  const totalOffset = lastItem ? convertCurrency(item.totalCny - lastItem.totalCny, "CNY", t("defaultCurrency")) : 0;

  return (
    <Card shadow="lg">
      <CardHeader className="flex items-start justify-between">
        <div>
          <div className="text-primary font-bold text-base">{`${currencyMap[t("defaultCurrency") as keyof typeof currencyMap]}${total}`}</div>
          <AmountOffset className="text-xs" currency={t("defaultCurrency")} offset={totalOffset} />
        </div>
        <div className="ml-3 bg-white bg-opacity-7 text-xs py-1 px-[6px] rounded">{date}</div>
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
  const { data: changeData } = useFinanceChangeData();
  const t = useTranslations("chart");
  const chartdata = useMemo(() => {
    const data: FinanceChartData[] = [];

    changeData.forEach((item, index) => {
      const lastItem = changeData[index - 1];

      const lastDate = lastItem?.date;

      if (lastDate) {
        const lastDateLength = getBetweenDateLength(new Date(lastDate), new Date(item.date));

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
        total: convertCurrency(item.totalCny, "CNY", t("defaultCurrency")),
        // totalOffset: lastItem ? convertCurrency(item.totalCny - lastItem.totalCny, "CNY", t("defaultCurrency")) : 0,
        item,
        lastItem,
      });
    });

    return data;
  }, [changeData, t]);

  const minValue = useMemo(() => {
    const totalList = chartdata.filter((item) => item.total !== undefined).map((item) => item.total!);

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
