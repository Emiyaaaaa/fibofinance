"use client";

import { Button } from "@heroui/button";
import { useTranslations } from "next-intl";
import { RiGithubLine } from "@remixicon/react";
import Link from "next/link";

import { Providers } from "./providers";

import FinanceModel from "@/components/financeModel";
import FinanceTable from "@/components/financeTable";
import useFinanceModel from "@/utils/store/useFinanceModel";
import { Logo } from "@/components/icons";
import LocaleSwitcher from "@/components/localeSwitcher";
import FinanceAI from "@/components/financeAI";
import FinanceChart from "@/components/financeChart";
import GroupSwitcher from "@/components/groupSwitcher";

const Page = () => {
  const { onOpen } = useFinanceModel();
  const t = useTranslations("home");

  return (
    <Providers>
      <header className="w-full pt-6 px-6 flex items-center">
        <Logo />
        <div className="flex-1" />
        <div className="flex gap-4 items-center">
          <GroupSwitcher />
          <LocaleSwitcher />
          <Link href="https://github.com/emiyaaaaa/fibofinance">
            <RiGithubLine size={22} />
          </Link>
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
