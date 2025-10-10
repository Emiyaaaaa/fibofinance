import { currencyMap, metalCurrencyMap } from "../utils/contants";
import { toFixed2 } from "../utils/exchangeRate";

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

  if (isNaN(amount)) {
    return "0";
  }

  const amountStyles = styles?.amount ?? {};
  const currencyStyles = styles?.currency ?? {};
  const unitStyles = styles?.unit ?? {};
  const Tag = tag;

  if (Object.keys(metalCurrencyMap).includes(currency)) {
    return (
      <Tag className={className}>
        <span style={amountStyles}>{toFixed2(amount)}</span>
        <span style={unitStyles}>g</span>
      </Tag>
    );
  }

  return (
    <Tag className={className}>
      <span style={currencyStyles}>{currencyMap[currency as keyof typeof currencyMap]}</span>
      <span style={amountStyles}>{toFixed2(amount)}</span>
    </Tag>
  );
};
