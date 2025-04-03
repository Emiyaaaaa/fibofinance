"use client";
import { Table, TableHeader, TableBody, TableColumn, TableRow, TableCell, getKeyValue } from "@heroui/table";
import { Spinner } from "@heroui/spinner";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import classNames from "classnames";
import { SortDirection } from "@react-types/shared";

import Time from "./time";
import AmountOffset from "./amountOffset";

import { financeTypeOrder, currencyMap, toFixed2 } from "@/utils";
import useFinanceModel from "@/utils/store/useFinanceModel";
import useClientWidth from "@/utils/hook/useClientWidth";
import useFinanceData from "@/utils/store/useFinanceData";
import { Finance } from "@/types";

export default function FinanceTable() {
  const t = useTranslations("finance");

  const { data, setData, aiData, updating } = useFinanceData();

  const [sortDescriptor, setSortDescriptor] = useState<{
    column: keyof Finance;
    direction: SortDirection;
  }>({
    column: "updated_at",
    direction: "descending",
  });

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
      const adviceAmount = aiData.find((advice) => advice.id === item.id)?.amount ?? item.amount;

      const offset = toFixed2(adviceAmount - item.amount);

      const hasOffset = offset !== 0;

      return {
        raw: item,
        key: item.id,
        name: <span className="font-bold">{item.name}</span>,
        type: item.type ? (
          <span
            className={classNames(
              "text-xs py-1 px-[6px] rounded",
              /* eslint-disable */
                item.type === "cash"       ? "bg-green-200  text-green-950"
              : item.type === "current"    ? "bg-blue-200   text-blue-950"
              : item.type === "low"        ? "bg-yellow-200 text-yellow-950"
              : item.type === "medium"     ? "bg-orange-200 text-orange-950"
              : item.type === "high"       ? "bg-red-300    text-red-950"
              : item.type === "fixed"       ? "bg-purple-200 text-purple-950"
              : item.type === "realEstate" ? "bg-purple-200 text-purple-950"
                                           : "bg-gray-200   text-gray-950",
              /* eslint-enable */
            )}
          >
            {t(item.type)}
          </span>
        ) : null,
        amount: (
          <div
            className={classNames(
              "flex flex-col gap-0.5 transition-all duration-250 h-8 justify-center font-bold w-max",
              { "text-sm": hasOffset },
            )}
          >
            <div className="text-primary">
              {currencyMap[item.currency as keyof typeof currencyMap]}
              {Number(item.amount)}
            </div>
            <AmountOffset currency={item.currency} offset={offset} />
          </div>
        ),
        updated_at: <Time date={new Date(item.updated_at)} format="YYYY-MM-DD HH:mm" />,
      };
    });
  }, [data, aiData]);

  useEffect(() => {
    console.log("datachange", data);
  }, [data]);

  return (
    <>
      <Table
        isStriped
        aria-label="Finance Table"
        sortDescriptor={sortDescriptor}
        onSortChange={(_sortDescriptor) => {
          const currentSortDescriptor = sortDescriptor;

          const newSortDescriptor = {
            column: _sortDescriptor.column,
            direction:
              _sortDescriptor.column === currentSortDescriptor.column
                ? currentSortDescriptor.direction === "ascending"
                  ? "descending"
                  : "ascending"
                : "descending",
          } as {
            column: keyof Finance;
            direction: SortDirection;
          };

          setSortDescriptor(newSortDescriptor);

          setData(
            [...data].sort((a, b) => {
              if (newSortDescriptor.column === "amount") {
                return newSortDescriptor.direction === "ascending" ? a.amount - b.amount : b.amount - a.amount;
              }

              if (newSortDescriptor.column === "updated_at") {
                return newSortDescriptor.direction === "ascending"
                  ? new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime()
                  : new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
              }

              if (newSortDescriptor.column === "name") {
                return newSortDescriptor.direction === "ascending"
                  ? a.name.localeCompare(b.name)
                  : b.name.localeCompare(a.name);
              }

              if (newSortDescriptor.column === "type") {
                const aIndex = financeTypeOrder.indexOf(a.type ?? "");
                const bIndex = financeTypeOrder.indexOf(b.type ?? "");

                return newSortDescriptor.direction === "ascending" ? aIndex - bIndex : bIndex - aIndex;
              }

              return 0;
            }),
          );
        }}
      >
        <TableHeader columns={columns}>
          {(column) => <TableColumn allowsSorting>{column.label}</TableColumn>}
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
              onClick={() => onOpen({ data: row.raw, hasDelete: true, submitType: "update" })}
            >
              {(columnKey) => <TableCell>{getKeyValue(row, columnKey)}</TableCell>}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
