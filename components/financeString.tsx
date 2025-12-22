"use client";

import { toFixed2 } from "../utils/exchangeRate";
import { useCurrencyData } from "../utils/store/useCurrencyData";

export const FinanceString = (props: {
  amount: number;
  tag?: "span" | "div";
  className?: string;
  currency?: string;
  styles?: {
    amount?: React.CSSProperties;
    currency?: React.CSSProperties;
    unit?: React.CSSProperties;
  };
}) => {
  const { amount, className, currency = "CNY", styles, tag = "span" } = props;
  const { currencyMap } = useCurrencyData();

  if (isNaN(amount)) {
    return "0";
  }

  const amountStyles = styles?.amount ?? {};
  const currencyStyles = styles?.currency ?? {};
  const unitStyles = styles?.unit ?? {};
  const Tag = tag;

  const currencyInfo = currencyMap[currency];

  if (!currencyInfo) {
    // Fallback if currency not found
    return (
      <Tag className={className}>
        <span style={amountStyles}>{toFixed2(amount)}</span>
      </Tag>
    );
  }

  // If currency has a unit, display amount + unit
  if (currencyInfo.unit) {
    return (
      <Tag className={className}>
        <span style={amountStyles}>{toFixed2(amount)}</span>
        <span style={unitStyles}>{currencyInfo.unit}</span>
      </Tag>
    );
  }

  // Otherwise, display symbol + amount
  return (
    <Tag className={className}>
      <span style={currencyStyles}>{currencyInfo.symbol}</span>
      <span style={amountStyles}>{toFixed2(amount)}</span>
    </Tag>
  );
};
