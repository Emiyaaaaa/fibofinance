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

export const convertCurrency = (amount: number, from: string, to: string) => {
  return (
    (amount * DEFAULT_EXCHANGE_RATE.rates[from]) /
    DEFAULT_EXCHANGE_RATE.rates[to]
  );
};

export const USD2CNY = (amount: number) => {
  return amount / DEFAULT_EXCHANGE_RATE.rates.USD;
};

export const CNY2USD = (amount: number) => {
  return amount * DEFAULT_EXCHANGE_RATE.rates.USD;
};
