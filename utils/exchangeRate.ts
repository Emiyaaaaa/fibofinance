export const DEFAULT_EXCHANGE_RATE: {
  base: string;
  rates: { [key: string]: number };
} = {
  base: "CNY",
  rates: {
    CNY: 1,
    USD: 0.1368,
    EUR: 0.1326,
    GBP: 0.1104,
    JPY: 20.7843,
  },
};

export const toFixed2 = (amount: number) => {
  return Math.round(amount * 100) / 100;
};

export const subAmount = (
  a: { amount: number; currency: string },
  b: { amount: number; currency: string },
  targetCurrency: string
) => {
  const aAmount = convertCurrency(a.amount, a.currency, targetCurrency);
  const bAmount = convertCurrency(b.amount, b.currency, targetCurrency);

  return toFixed2(aAmount - bAmount);
};

export const convertCurrency = (amount: number, from: string, to: string) => {
  if (from === to) {
    return toFixed2(amount);
  }

  return toFixed2(
    (amount / DEFAULT_EXCHANGE_RATE.rates[from]) *
      DEFAULT_EXCHANGE_RATE.rates[to]
  );
};

export const USD2CNY = (amount: number) => {
  return toFixed2(amount / DEFAULT_EXCHANGE_RATE.rates.USD);
};

export const CNY2USD = (amount: number) => {
  return toFixed2(amount * DEFAULT_EXCHANGE_RATE.rates.USD);
};
