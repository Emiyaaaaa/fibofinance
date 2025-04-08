import classNames from "classnames";

import { currencyMap } from "@/utils";

export default function AmountOffset(props: { offset?: number; className?: string; currency?: string }) {
  const { offset, className, currency } = props;

  if (!offset) {
    return null;
  }

  return (
    <div className={className}>
      <span
        className={classNames({
          "text-red-500": offset > 0,
          "text-green-500": offset < 0,
        })}
      >
        {`${offset > 0 ? "+" : "-"}${currencyMap[currency as keyof typeof currencyMap]}${Math.abs(offset)}`}
      </span>
    </div>
  );
}
