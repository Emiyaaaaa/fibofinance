import { Finance } from "@/types";
import { DEFAULT_EXCHANGE_RATE } from "./exchangeRate";

export const getTotalFinance = (
  data: Finance[],
  targetCurrency: string,
  params: { rates?: Record<string, number>; useLatestRates?: boolean } = {}
) => {
  const { rates, useLatestRates } = params;
  if ([...new Set(data.map((item) => item.currency))].length === 1 && data[0].currency === targetCurrency) {
    return data.reduce((acc, item) => acc + Number(item.amount), 0);
  }

  const rateTable = rates ?? DEFAULT_EXCHANGE_RATE.rates;

  const totalAmountCNY = data.reduce((acc, item) => {
    if (!useLatestRates) {
      let amountCNY = Number(item.amount_cny);
      if (Number.isNaN(amountCNY)) {
        const rate = rateTable[item.currency];
        amountCNY = Number(item.amount) / rate;
      }

      return acc + Number(amountCNY);
    } else {
      const rate = rates?.[item.currency] ?? DEFAULT_EXCHANGE_RATE.rates[item.currency] ?? 1;
      return acc + Number(item.amount) / rate;
    }
  }, 0);

  const total =
    // @ts-ignore
    totalAmountCNY * rateTable[targetCurrency];

  return total;
};
