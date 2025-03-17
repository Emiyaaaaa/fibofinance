"use client";

import { LineChart } from "@/components/tremor/lineChart";
import useFinanceChangeData from "@/utils/store/useFinanceChangeData";

export default function FinanceChart() {
  const { data } = useFinanceChangeData();
  const chartdata = data.map((item) => ({
    date: item.created_at,
    total_usd: item.total_usd,
    total_cny: item.total_cny,
  }));

  return (
    <LineChart
      categories={["total_usd", "total_cny"]}
      className="h-80"
      data={chartdata}
      index="date"
      valueFormatter={(number: number) =>
        `$${Intl.NumberFormat("us").format(number).toString()}`
      }
      onValueChange={(v) => console.log(v)}
    />
  );
}
