import { Finance } from "@/types";
import CountUp from "./CountUp";
import { useRequest } from "ahooks";
import { getTotalFinance } from "@/utils/totalFinance";
import { currencyMap, toFixed2 } from "@/utils";

export default function AllFinanceCount() {
  const { data: financeData } = useRequest<Finance[], []>(() => fetch("/api/finance").then((res) => res.json()));

  if (!financeData) return null;

  const totalAmount = toFixed2(getTotalFinance(financeData, "CNY"));

  return (
    <span className="text-primary text-xl md:text-4xl font-bold hidden md:block" style={{ fontFamily: "Rajdhani" }}>
      {currencyMap["CNY"]}
      <CountUp from={0} to={totalAmount} direction="up" duration={0.5} />
    </span>
  );
}
