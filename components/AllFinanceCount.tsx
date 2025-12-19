import { Finance } from "@/types";
import CountUp from "./CountUp";
import { useRequest } from "ahooks";
import { getTotalFinance } from "@/utils/totalFinance";
import { currencyMap, toFixed2 } from "@/utils";
import { useTranslations } from "next-intl";
import { useFinanceExchangeRateData } from "@/utils/store/useFinanceExchangeRateData";

export default function AllFinanceCount() {
  const { data: financeData } = useRequest<Finance[], []>(() => fetch("/api/finance").then((res) => res.json()));
  const { latestData } = useFinanceExchangeRateData();
  const t = useTranslations("chart");

  if (!financeData) return null;
  if (!latestData) return null;

  const totalAmount = toFixed2(getTotalFinance(financeData, t("defaultCurrency"), latestData));

  return (
    <span className="text-primary text-xl md:text-4xl font-bold hidden md:block" style={{ fontFamily: "Rajdhani" }}>
      {currencyMap[t("defaultCurrency") as keyof typeof currencyMap]}
      <CountUp from={0} to={totalAmount} direction="up" duration={0.2} />
    </span>
  );
}
