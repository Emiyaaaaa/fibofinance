export const financeType = ["cash", "current", "low", "medium", "high", "fixed", "realEstate", "other"];
export const financeTypeOrder = [...financeType, ""];

export const moneyCurrencyMap = {
  USD: "$",
  CNY: "¥",
  EUR: "€",
  GBP: "£",
  JPY: "¥",
};

export const metalCurrencyMap = {
  XAU: "Au",
};

export const currencyMap = { ...moneyCurrencyMap, ...metalCurrencyMap };
