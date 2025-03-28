"use client";

import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { Card, CardHeader, CardBody, CardFooter } from "@heroui/card";

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

  if (!data) {
    return null;
  }

  const total = `${currencyMap[t("defaultCurrency") as keyof typeof currencyMap]}${
    data.total
  }`;

  return (
    <Card shadow="lg">
      <CardHeader>{t("total")}</CardHeader>
      <CardBody>{total}</CardBody>
      <CardFooter>{data.date}</CardFooter>
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
