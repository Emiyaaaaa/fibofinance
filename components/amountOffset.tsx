import classNames from "classnames";
import { FinanceString } from "@/components/financeString";

export default function AmountOffset(props: { offset?: number; className?: string; currency?: string }) {
  const { offset, className, currency } = props;

  if (!offset) {
    return null;
  }

  return (
    <div className={className}>
      <FinanceString
        amount={Math.abs(offset)}
        currency={currency}
        className={classNames({
          "text-red-500": offset > 0,
          "text-green-500": offset < 0,
        })}
      />
    </div>
  );
}
