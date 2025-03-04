"use client";

import { Button } from "@heroui/button";
import { useTranslations } from "next-intl";

import { Providers } from "./providers";

import FinanceModel from "@/components/model";
import FinanceTable from "@/components/financeTable";
import useFinanceModel from "@/utils/store/useFinanceModel";

const Page = () => {
  const { onOpen } = useFinanceModel();
  const t = useTranslations("home");

  return (
    <Providers>
      <Button className="mb-4" color="primary" onPress={() => onOpen()}>
        {t("addFinance")}
      </Button>
      <FinanceModel />
      <FinanceTable />
    </Providers>
  );
};

export default Page;
