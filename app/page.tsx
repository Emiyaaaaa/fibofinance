"use client";

import { Button } from "@heroui/react";
import { RiGithubLine } from "@remixicon/react";
import Link from "next/link";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

import FinanceModal from "@/components/financeModal";
import FinanceTable from "@/components/financeTable";
import useFinanceModal from "@/utils/store/useFinanceModal";
import { Logo } from "@/components/icons";
import LocaleSwitcher from "@/components/localeSwitcher";
import FinanceAI from "@/components/financeAI";
import FinanceChart from "@/components/financeChart";
import FinanceDonutChart from "@/components/financeDonutChart";
import GroupSwitcher from "@/components/groupSwitcher";
import useFinanceChangeData from "@/utils/store/useFinanceChangeData";
import { useGroup } from "@/utils/store/useGroup";
import { useFinanceData } from "@/utils/store/useFinanceData";
import useFinanceGroupData from "@/utils/store/useFinanceGroupData";
import AllFinanceCount from "@/components/AllFinanceCount";
import ExchangeRateSettings from "@/components/exchangeRateSettings";

const Page = () => {
  const { onOpen } = useFinanceModal();
  const t = useTranslations("home");
  const query = useSearchParams();

  const { initData: initGroupData, groupId, setGroupId } = useGroup();
  const { initData: initFinanceChangeData } = useFinanceChangeData();
  const { initData: initFinanceGroupData } = useFinanceGroupData();
  const { initData: initFinanceData } = useFinanceData();

  // 初始化 groupId
  useEffect(() => {
    const queryGroupId = query.get("group_id");

    if (queryGroupId) {
      setGroupId(Number(queryGroupId));
    }
  }, []);

  useEffect(() => {
    initGroupData();
    initFinanceGroupData();
  }, []);

  useEffect(() => {
    if (groupId) {
      initFinanceData(groupId);
      initFinanceChangeData(groupId);
    }
  }, [groupId]);

  return (
    <>
      <header className="w-full pt-6 px-6 flex items-center">
        <Logo />
        <AllFinanceCount />
        <div className="flex-1" />
        <div className="flex gap-4 items-center">
          <ExchangeRateSettings />
          <GroupSwitcher />
          <LocaleSwitcher />
          <Link href="https://github.com/emiyaaaaa/fibofinance">
            <RiGithubLine size={22} />
          </Link>
        </div>
      </header>
      <main className="container mx-auto max-w-3xl pt-4 grow px-3 md:px-6 md:pt-16">
        <Button className="mb-4" color="primary" onPress={() => onOpen()}>
          {t("addFinance")}
        </Button>
        <FinanceModal />
        <div className="flex flex-col gap-6">
          <FinanceTable />
          <FinanceChart />
          <FinanceDonutChart />
          <FinanceAI />
        </div>
        <div className="text-center mt-16 text-sm opacity-80">
          <span>Powered by </span>
          <Link className="text-primary" href="https://github.com/emiyaaaaa">
            Haozheng Li
          </Link>
        </div>
        <div className="mt-4" />
      </main>
    </>
  );
};

export default Page;
