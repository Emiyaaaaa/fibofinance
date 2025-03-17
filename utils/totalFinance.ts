import { DEFAULT_EXCHANGE_RATE } from "./exchangeRate";

export const getTotalFinance = (
  data: { amount: number; currency: string }[],
  targetCurrency: string
) => {
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
