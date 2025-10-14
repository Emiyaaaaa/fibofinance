import classNames from "classnames";
import { FinanceString } from "@/components/financeString";
import { convertCurrency } from "@/utils";
import { useTranslations } from "next-intl";

export default function AmountOffset(props: {
  offset?: number;
  className?: string;
  currency?: string;
  offset_cny?: number;
}) {
  const { offset, className, currency, offset_cny } = props;
  const t = useTranslations("chart");

  if (!offset && !offset_cny) {
    return null;
  }

  return (
    <div
      className={classNames(className, {
        "text-red-500": (offset || offset_cny)! > 0,
        "text-green-500": (offset || offset_cny)! < 0,
      })}
    >
      <FinanceString amount={Math.abs(offset || 0)} currency={currency} />
      {offset_cny && currency !== t("defaultCurrency") && (
        <>
          {" ("}
          <FinanceString
            amount={Math.abs(convertCurrency(offset_cny, "CNY", t("defaultCurrency")))}
            currency={t("defaultCurrency")}
          />
          {")"}
        </>
      )}
    </div>
  );
}
