import { Finance } from "@/types";
import CountUp from "./CountUp";
import { useRequest } from "ahooks";
import { getTotalFinance } from "@/utils/totalFinance";
import { toFixed2 } from "@/utils";
import { useTranslations } from "next-intl";
import { useFinanceExchangeRateData } from "@/utils/store/useFinanceExchangeRateData";
import { useCurrencyData } from "@/utils/store/useCurrencyData";

export default function AllFinanceCount() {
  const { data: financeData } = useRequest<Finance[], []>(() => fetch("/api/finance").then((res) => res.json()));
  const { latestRates } = useFinanceExchangeRateData();
  const { currencyMap } = useCurrencyData();
  const t = useTranslations("chart");

  if (!financeData) return null;
  if (!latestRates) return null;

  const totalAmount = toFixed2(getTotalFinance(financeData, t("defaultCurrency"), latestRates));
  const defaultCurrencySymbol = currencyMap[t("defaultCurrency")]?.symbol || t("defaultCurrency");

  return (
    <span className="text-primary text-xl md:text-4xl font-bold hidden md:block" style={{ fontFamily: "Rajdhani" }}>
      {defaultCurrencySymbol}
      <CountUp from={0} to={totalAmount} direction="up" duration={0.2} />
    </span>
  );
}
