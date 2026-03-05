import { Finance } from "@/types";
import NumberFlow from "@number-flow/react";
import { useRequest } from "ahooks";
import { getTotalFinance } from "@/utils/totalFinance";
import { toFixed2 } from "@/utils";
import { useTranslations } from "next-intl";
import { useFinanceExchangeRateData } from "@/utils/store/useFinanceExchangeRateData";
import { useCurrencyData } from "@/utils/store/useCurrencyData";
import { useEffect, useState } from "react";

export default function FinanceTotal() {
  const { data: financeData } = useRequest<Finance[], []>(() => fetch("/api/finance").then((res) => res.json()));
  const { latestRates } = useFinanceExchangeRateData();
  const { currencyMap } = useCurrencyData();
  const t = useTranslations("chart");
  const [totalAmount, setTotalAmount] = useState<number | undefined>();

  useEffect(() => {
    if (!financeData) return;
    if (!latestRates) return;
    const totalAmount = toFixed2(getTotalFinance(financeData, t("defaultCurrency"), latestRates));

    setTotalAmount(0);
    const timeout = setTimeout(() => setTotalAmount(totalAmount), 100);

    return () => {
      clearTimeout(timeout);
    };
  }, [financeData, latestRates]);

  const defaultCurrencySymbol = currencyMap[t("defaultCurrency")]?.symbol;

  if (totalAmount === undefined) return null;

  return (
    <span className="text-primary text-xl md:text-4xl font-bold hidden md:block" style={{ fontFamily: "Rajdhani" }}>
      <NumberFlow
        value={totalAmount}
        prefix={defaultCurrencySymbol}
        format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }}
      />
    </span>
  );
}
