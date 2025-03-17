"use client";

import { Button } from "@heroui/button";
import { useTranslations } from "next-intl";
import { useEffect } from "react";

import { Providers } from "./providers";

import FinanceModel from "@/components/financeModel";
import FinanceTable from "@/components/financeTable";
import useFinanceModel from "@/utils/store/useFinanceModel";
import { GithubIcon, Logo } from "@/components/icons";
import LocaleSelector from "@/components/locelSelector";
import FinanceAI from "@/components/financeAI";
import useFinanceData from "@/utils/store/useFinanceData";
import FinanceChart from "@/components/financeChart";
import useFinanceChangeData from "@/utils/store/useFinanceChangeData";

const Page = () => {
  const { onOpen } = useFinanceModel();
  const { updateData: updateFinanceData } = useFinanceData();
  const { updateData: updateFinanceChangeData } = useFinanceChangeData();
  const t = useTranslations("home");

  useEffect(() => {
    updateFinanceData();
    updateFinanceChangeData();
  }, []);

  return (
    <Providers>
      <header className="w-full pt-6 px-6 flex items-center">
        <Logo />
        <div className="flex-1" />
        <LocaleSelector />
        <div className="ml-4">
          <a href="https://github.com/emiyaaaaa/fibofinance">
            <GithubIcon />
          </a>
        </div>
      </header>
      <main className="container mx-auto max-w-3xl pt-16 flex-grow px-3 md:px-6">
        <Button className="mb-4" color="primary" onPress={() => onOpen()}>
          {t("addFinance")}
        </Button>
        <FinanceModel />
        <FinanceTable />
        <div className="mt-16" />
        <FinanceAI />
        <FinanceChart />
      </main>
    </Providers>
  );
};

export default Page;
