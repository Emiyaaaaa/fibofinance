"use client";

import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { Card, CardHeader, CardBody } from "@heroui/card";
import { Divider } from "@heroui/divider";
import { Chip } from "@heroui/chip";

import { LineChart, TooltipProps } from "@/components/tremor/lineChart";
import { convertCurrency } from "@/utils/exchangeRate";
import useFinanceChangeData from "@/utils/store/useFinanceChangeData";
import { Finance } from "@/types";
import { currencyMap } from "@/utils";

function CustomTooltip(props: TooltipProps) {
  const t = useTranslations("chart");

  const data = props.payload?.[0]?.payload as {
    total: number;
    date: string;
    finance: Finance[];
  };

  if (!data?.finance.length) {
    return null;
  }

  const total = `${currencyMap[t("defaultCurrency") as keyof typeof currencyMap]}${
    data.total
  }`;

  return (
    <Card shadow="lg">
      <CardHeader className="flex items-center justify-between text-base text-primary font-bold">
        {total}
        <Chip className="ml-3" size="sm">
          {data.date}
        </Chip>
      </CardHeader>
      <Divider />
      <CardBody className="flex flex-col gap-2 text-xs">
        {data.finance.map((item) => (
          <div key={item.id} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full" />
              {item.name}
            </div>
            <div className="pl-2">
              {`${currencyMap[item.currency]}${item.amount}`}
            </div>
          </div>
        ))}
      </CardBody>
    </Card>
  );
}

export default function FinanceChart() {
  const { data: changeData, financeData } = useFinanceChangeData();
  const t = useTranslations("chart");
  const chartdata = useMemo(
    () =>
      changeData.map((item) => ({
        date: item.date,
        total: convertCurrency(item.total_cny, "CNY", t("defaultCurrency")),
        finance: item.financeData,
      })),
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
