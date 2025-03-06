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
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";

import Time from "./time";

import useFinanceModel from "@/utils/store/useFinanceModel";
import useRefresh from "@/utils/store/useRefresh";
import { Finance } from "@/types";
import useClientWidth from "@/utils/hook/useClientWidth";
import { currencyMap } from "@/utils";

export default function FinanceTable() {
  const t = useTranslations("finance");

  const [data, setData] = useState<Finance[]>([]);
  const { refresh } = useRefresh();
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
    return data.map((item) => ({
      raw: item,
      key: item.id,
      name: <span className="font-bold">{item.name}</span>,
      type: item.type,
      amount: (
        <span className="font-bold text-primary">
          {currencyMap[item.currency as keyof typeof currencyMap]}
          {item.amount}
        </span>
      ),
      updated_at: (
        <Time date={new Date(item.updated_at)} format="YYYY-MM-DD HH:mm" />
      ),
    }));
  }, [data]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("/api/finance");
      const data = await res.json();

      setData(data);
    };

    fetchData();
  }, [refresh]);

  return (
    <>
      <Table aria-label="Finance Table">
        <TableHeader columns={columns}>
          {(column) => <TableColumn>{column.label}</TableColumn>}
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={row.key}
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
