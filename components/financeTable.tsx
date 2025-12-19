"use client";

import {
  Spinner,
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
  getKeyValue,
  Tooltip,
} from "@heroui/react";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import classNames from "classnames";
import { SortDirection } from "@react-types/shared";

import AmountOffset from "./amountOffset";
import IconRenderer from "./iconRenderer";

import { chartColors, financeTypeColors, financeTypeOrder, toFixed2 } from "@/utils";
import useFinanceModal from "@/utils/store/useFinanceModal";
import useClientWidth from "@/utils/hook/useClientWidth";
import useFinanceData from "@/utils/store/useFinanceData";
import { Finance } from "@/types";
import { FinanceString } from "@/components/financeString";
import { formatRelativeTime } from "@/utils/formatRelativeTime";
import { transformDate } from "@/utils/transformDate";

export default function FinanceTable() {
  const t = useTranslations("finance");

  const { data, setData, aiData, updating } = useFinanceData();

  const [status, setStatus] = useState<"updating" | "animate-start" | "animate-end">("updating");

  const [sortDescriptor, setSortDescriptor] = useState<{
    column: keyof Finance;
    direction: SortDirection;
  }>({
    column: "updated_at",
    direction: "descending",
  });

  const { onOpen } = useFinanceModal();
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
        name: (
          <div className="flex items-center gap-2">
            <IconRenderer iconKey={item.icon} size={20} />
            <span className="font-bold">{item.name}</span>
          </div>
        ),
        type: item.type ? (
          <span
            className={classNames(
              "text-[10px] py-1 px-[6px] rounded whitespace-nowrap text-black/90",
              chartColors[financeTypeColors[item.type]].bg
            )}
          >
            {t(item.type)}
          </span>
        ) : null,
        amount: (
          <div
            className={classNames(
              "flex flex-col gap-0.5 transition-all duration-250 h-8 justify-center font-bold w-max whitespace-nowrap",
              { "text-sm": hasOffset }
            )}
          >
            <FinanceString
              amount={Number(item.amount)}
              currency={item.currency}
              className="text-primary"
              styles={{
                currency: { paddingRight: "1px" },
                unit: { paddingLeft: "1px" },
              }}
            />
            <AmountOffset currency={item.currency} offset={offset} />
          </div>
        ),
        updated_at: (
          <Tooltip content={transformDate(new Date(item.updated_at), "YYYY-MM-DD HH:mm")}>
            <span>{formatRelativeTime(new Date(item.updated_at))}</span>
          </Tooltip>
        ),
      };
    });
  }, [data, aiData]);

  useEffect(() => {
    if (updating) {
      setStatus("updating");
    } else {
      setStatus("animate-start");
      requestAnimationFrame(() => {
        setStatus("animate-end");
      });
    }
  }, [updating]);

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
            })
          );
        }}
      >
        <TableHeader columns={columns}>
          {(column) => <TableColumn allowsSorting>{column.label}</TableColumn>}
        </TableHeader>
        <TableBody
          emptyContent={t("empty-content")}
          isLoading={updating}
          className={classNames("transition-opacity duration-100", { "opacity-40": updating })}
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
              className={classNames("opacity-0", {
                "opacity-100 transition-opacity sibling-index-delay duration-500": status === "animate-end",
              })}
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
