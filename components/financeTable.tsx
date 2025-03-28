"use client";
import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
  getKeyValue,
} from "@heroui/table";
import { Spinner } from "@heroui/spinner";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import classNames from "classnames";

import Time from "./time";

import useFinanceModel from "@/utils/store/useFinanceModel";
import useClientWidth from "@/utils/hook/useClientWidth";
import { currencyMap, toFixed2 } from "@/utils";
import useFinanceData from "@/utils/store/useFinanceData";

export default function FinanceTable() {
  const t = useTranslations("finance");

  const { data, aiData, updating } = useFinanceData();

  const { onOpen } = useFinanceModel();
  const clientWidth = useClientWidth();

  const showUpdateTime = clientWidth > 768;

  const columns = useMemo(() => {
    return [
      { key: "name", label: t("name") },
      { key: "type", label: t("type") },
      { key: "amount", label: t("amount") },
      showUpdateTime ? { key: "updated_at", label: t("updateTime") } : null,
    ].filter(Boolean) as { key: string; label: string }[];
  }, [showUpdateTime, t]);

  const rows = useMemo(() => {
    return data.map((item) => {
      const adviceAmount =
        aiData.find((advice) => advice.id === item.id)?.amount ?? item.amount;

      const offset = toFixed2(adviceAmount - item.amount);

      const hasOffset = offset !== 0;

      return {
        raw: item,
        key: item.id,
        name: <span className="font-bold">{item.name}</span>,
        type: item.type,
        amount: (
          <div
            className={classNames(
              "flex flex-col gap-0.5 transition-all duration-250 h-8 justify-center font-bold w-max",
              { "text-sm": hasOffset }
            )}
          >
            <div className="text-primary">
              {currencyMap[item.currency as keyof typeof currencyMap]}
              {Number(item.amount)}
            </div>
            {hasOffset && (
              <div
                className={classNames({
                  "text-green-500": offset > 0,
                  "text-red-500": offset < 0,
                })}
              >
                {offset > 0 ? "+" : "-"}
                {Math.abs(offset)}
              </div>
            )}
          </div>
        ),
        updated_at: (
          <Time date={new Date(item.updated_at)} format="YYYY-MM-DD HH:mm" />
        ),
      };
    });
  }, [data, aiData]);

  return (
    <>
      <Table isStriped aria-label="Finance Table">
        <TableHeader columns={columns}>
          {(column) => <TableColumn>{column.label}</TableColumn>}
        </TableHeader>
        <TableBody
          emptyContent={t("empty-content")}
          isLoading={updating}
          loadingContent={
            <div className="relative h-full w-full">
              <div className="absolute flex items-center justify-center h-[calc(100%-50px)] w-full bottom-0">
                <Spinner size="md" variant="gradient" />
              </div>
            </div>
          }
        >
          {rows.map((row) => (
            <TableRow
              key={row.key}
              className={`${updating ? "opacity-40" : "transition-opacity duration-100"}`}
              onClick={() =>
                onOpen({ data: row.raw, hasDelete: true, submitType: "update" })
              }
            >
              {(columnKey) => (
                <TableCell>{getKeyValue(row, columnKey)}</TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
