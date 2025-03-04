"use client";
import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
} from "@heroui/table";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import useFinanceModel from "@/utils/store/useFinanceModel";
interface Finance {
  id: number;
  name: string;
  type: string;
  amount: number;
  currency: string;
}

export default function FinanceTable() {
  const t = useTranslations("finance");

  const [data, setData] = useState<Finance[]>([]);
  const { onOpen } = useFinanceModel();

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("/api/finance");
      const data = await res.json();

      console.log(data);

      setData(data);
    };

    fetchData();
  }, []);

  return (
    <>
      <Table aria-label="Example static collection table">
        <TableHeader>
          <TableColumn>{t("name")}</TableColumn>
          <TableColumn>{t("type")}</TableColumn>
          <TableColumn>{t("amount")}</TableColumn>
          <TableColumn>{t("currency")}</TableColumn>
        </TableHeader>
        <TableBody>
          {data.map((item) => (
            <TableRow
              key={item.id}
              onClick={() =>
                onOpen({ data: item, hasDelete: true, submitType: "update" })
              }
            >
              <TableCell>{item.name}</TableCell>
              <TableCell>{item.type}</TableCell>
              <TableCell>{item.amount}</TableCell>
              <TableCell>{t(item.currency)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
