import { Finance } from "@/types";

export const DEFAULT_EXCHANGE_RATE = {
  base: "CNY",
  rates: {
    CNY: 1,
    USD: 0.1368,
    EUR: 0.1326,
    GBP: 0.1104,
    JPY: 20.7843,
  },
};

export const getTotalFinance = (data: Finance[], targetCurrency: string) => {
  const totalAmountCNY = data.reduce((acc, item) => {
    const rate = DEFAULT_EXCHANGE_RATE.rates[item.currency];

    const amountCNY = item.amount / rate;

    return acc + amountCNY;
  }, 0);

  const total =
    // @ts-ignore
    totalAmountCNY * DEFAULT_EXCHANGE_RATE.rates[targetCurrency];

  return total;
};
