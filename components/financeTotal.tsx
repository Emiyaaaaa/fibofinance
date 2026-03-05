import NumberFlow from "@number-flow/react";
import { Tooltip } from "@heroui/react";
import { getTotalFinance } from "@/utils/totalFinance";
import { toFixed2 } from "@/utils";
import { useTranslations } from "next-intl";
import { useFinanceExchangeRateData } from "@/utils/store/useFinanceExchangeRateData";
import { useCurrencyData } from "@/utils/store/useCurrencyData";
import { useFinanceData } from "@/utils/store/useFinanceData";
import { useFinanceTotalData } from "@/utils/store/useFinanceTotalData";
import { useEffect, useState } from "react";

export default function FinanceTotal() {
  const { data: financeData } = useFinanceData();
  const { data: totalData } = useFinanceTotalData();
  const { latestRates } = useFinanceExchangeRateData();
  const { currencyMap } = useCurrencyData();
  const t = useTranslations("chart");
  const [groupAmount, setGroupAmount] = useState<number>(0);
  const [allAmount, setAllAmount] = useState<number>(0);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    if (!financeData || !latestRates) return;
    setGroupAmount(
      toFixed2(
        getTotalFinance(financeData, t("defaultCurrency"), {
          rates: latestRates,
          useLatestRates: true,
        })
      )
    );
  }, [financeData, latestRates]);

  useEffect(() => {
    if (!totalData?.length || !latestRates) return;
    setAllAmount(
      toFixed2(
        getTotalFinance(totalData, t("defaultCurrency"), {
          rates: latestRates,
          useLatestRates: true,
        })
      )
    );
  }, [totalData, latestRates]);

  const displayAmount = showAll ? allAmount : groupAmount;

  if (!displayAmount) return null;

  return (
    <Tooltip content={showAll ? t("switchToGroup") : t("switchToAll")}>
      <span
        className="text-primary text-xl md:text-4xl font-bold hidden md:block cursor-pointer select-none"
        style={{ fontFamily: "Rajdhani" }}
        onClick={() => setShowAll((v) => !v)}
      >
        <NumberFlow
          value={displayAmount}
          prefix={currencyMap[t("defaultCurrency")]?.symbol}
          format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }}
        />
      </span>
    </Tooltip>
  );
}
