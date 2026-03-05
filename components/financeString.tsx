"use client";

import NumberFlow from "@number-flow/react";
import { toFixed2 } from "../utils/exchangeRate";
import { useCurrencyData } from "../utils/store/useCurrencyData";

const numberFormat = { maximumFractionDigits: 2 };

export const FinanceString = (props: {
  amount: number;
  tag?: "span" | "div";
  className?: string;
  currency?: string;
  animated?: boolean;
  styles?: {
    amount?: React.CSSProperties;
    currency?: React.CSSProperties;
    unit?: React.CSSProperties;
  };
}) => {
  const { amount, className, currency = "CNY", styles, tag = "span", animated = false } = props;
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
    return (
      <Tag className={className}>
        {animated ? (
          <NumberFlow value={amount} format={numberFormat} style={amountStyles} />
        ) : (
          <span style={amountStyles}>{toFixed2(amount)}</span>
        )}
      </Tag>
    );
  }

  if (currencyInfo.unit) {
    return (
      <Tag className={className}>
        {animated ? (
          <NumberFlow value={amount} format={numberFormat} suffix={currencyInfo.unit} style={amountStyles} />
        ) : (
          <>
            <span style={amountStyles}>{toFixed2(amount)}</span>
            <span style={unitStyles}>{currencyInfo.unit}</span>
          </>
        )}
      </Tag>
    );
  }

  return (
    <Tag className={className}>
      {animated ? (
        <NumberFlow value={amount} format={numberFormat} prefix={currencyInfo.symbol} style={amountStyles} />
      ) : (
        <>
          <span style={currencyStyles}>{currencyInfo.symbol}</span>
          <span style={amountStyles}>{toFixed2(amount)}</span>
        </>
      )}
    </Tag>
  );
};
