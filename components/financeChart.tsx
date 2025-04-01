"use client";

import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { Card, CardHeader, CardBody } from "@heroui/card";
import { Divider } from "@heroui/divider";

import AmountOffset from "./amountOffset";

import { LineChart, TooltipProps } from "@/components/tremor/lineChart";
import { convertCurrency, subAmount } from "@/utils/exchangeRate";
import useFinanceChangeData from "@/utils/store/useFinanceChangeData";
import { Finance } from "@/types";
import { currencyMap } from "@/utils";

function CustomTooltip(props: TooltipProps) {
  const t = useTranslations("chart");

  const data = props.payload?.[0]?.payload as {
    total: number;
    totalOffset: number;
    date: string;
    finance: (Finance & { offset?: number })[];
  };

  if (!data?.finance.length) {
    return null;
  }

  const total = `${currencyMap[t("defaultCurrency") as keyof typeof currencyMap]}${
    data.total
  }`;

  return (
    <Card shadow="lg">
      <CardHeader className="flex items-center justify-between">
        <div>
          <div className="text-primary font-bold text-base">{total}</div>
          <AmountOffset
            className="text-xs"
            currency={t("defaultCurrency")}
            offset={data.totalOffset}
          />
        </div>
        <div className="ml-3 bg-white bg-opacity-7 text-xs py-1 px-[6px] rounded">
          {data.date}
        </div>
      </CardHeader>
      <Divider />
      <CardBody className="flex flex-col gap-2 text-xs">
        {data.finance.map((item) => (
          <div key={item.id} className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full" />
              {item.name}
            </div>
            <div className="pl-2 flex flex-col items-end">
              <div className="text-primary">{`${currencyMap[item.currency]}${item.amount}`}</div>
              <AmountOffset
                className="text-xs"
                currency={item.currency}
                offset={item.offset}
              />
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
  const chartdata = useMemo(
    () =>
      changeData.map((item, index) => {
        const lastItem = changeData[index - 1];
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

        return {
          date: item.date,
          total: convertCurrency(item.total_cny, "CNY", t("defaultCurrency")),
          totalOffset: lastItem
            ? convertCurrency(
                item.total_cny - lastItem.total_cny,
                "CNY",
                t("defaultCurrency")
              )
            : 0,
          finance: financeList,
        };
      }),
    [changeData, t]
  );

  if (!chartdata.length) {
    return null;
  }

  return (
    <div className="relative w-full p-4">
      <LineChart
        categories={["total"]}
        className="h-80"
        colors={["primary"]}
        customTooltip={CustomTooltip}
        data={chartdata}
        index="date"
        showLegend={false}
      />
    </div>
  );
}
