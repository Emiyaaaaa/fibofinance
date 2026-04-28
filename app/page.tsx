"use client";

import { Button, Spinner } from "@heroui/react";
import { RiGithubLine } from "@remixicon/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import FinanceTotal from "@/components/financeTotal";
import ExchangeRateSettings from "@/components/exchangeRateSettings";
import { useCurrencyData } from "@/utils/store/useCurrencyData";
import { useFinanceExchangeRateData } from "@/utils/store/useFinanceExchangeRateData";
import useFinanceTotalDataStore from "@/utils/store/useFinanceTotalData";
import PasswordSettings from "@/components/passwordSettings";
import { DEFAULT_PASSWORD_LENGTH, normalizePasswordLength } from "@/utils/password";

const Page = () => {
  const { onOpen } = useFinanceModal();
  const t = useTranslations("home");
  const query = useSearchParams();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  const { initData: initGroupData, groupId, setGroupId } = useGroup();
  const { initData: initFinanceChangeData } = useFinanceChangeData();
  const { initData: initFinanceGroupData } = useFinanceGroupData();
  const { initData: initFinanceData } = useFinanceData();
  const { initData: initCurrencyData } = useCurrencyData();
  const { initData: initExchangeRateData } = useFinanceExchangeRateData();
  const initTotalData = useFinanceTotalDataStore((s) => s.initData);

  useEffect(() => {
    fetch("/api/auth/check")
      .then(async (res) => {
        if (res.ok) {
          setIsAuthorized(true);
          return;
        }

        const data = await res.json().catch(() => ({}));
        const passwordLength = normalizePasswordLength(data.passwordLength ?? DEFAULT_PASSWORD_LENGTH);

        router.replace(`/login?length=${passwordLength}`);
      })
      .catch(() => {
        router.replace(`/login?length=${DEFAULT_PASSWORD_LENGTH}`);
      });
  }, [router]);

  // 初始化 groupId
  useEffect(() => {
    if (!isAuthorized) return;

    const queryGroupId = query.get("group_id");

    if (queryGroupId) {
      setGroupId(Number(queryGroupId));
    }
  }, [isAuthorized, query, setGroupId]);

  // 初始化全局数据（只需要初始化一次）
  useEffect(() => {
    if (!isAuthorized) return;

    initGroupData();
    initFinanceGroupData();
    initCurrencyData();
    initExchangeRateData();
    initTotalData();
  }, [isAuthorized, initCurrencyData, initExchangeRateData, initFinanceGroupData, initGroupData, initTotalData]);

  // 初始化依赖 groupId 的数据
  useEffect(() => {
    if (!isAuthorized) return;

    if (groupId) {
      initFinanceData();
      initFinanceChangeData();
    }
  }, [groupId, initFinanceChangeData, initFinanceData, isAuthorized]);

  if (!isAuthorized) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" variant="gradient" />
      </div>
    );
  }

  return (
    <>
      <header className="w-full pt-6 px-6 flex items-center md:h-[80px] md:pt-0">
        <Logo />
        <FinanceTotal />
        <div className="flex-1" />
        <div className="flex gap-4 items-center">
          <GroupSwitcher />
          <ExchangeRateSettings />
          <PasswordSettings />
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
          <div className="h-4" />
          <FinanceAI />
        </div>
        <div className="mt-6" />
      </main>
    </>
  );
};

export default Page;
