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
  const [sqlExists, setSqlExists] = useState<boolean | null>(null);

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
        const data = await res.json().catch(() => ({}));
        setSqlExists(data.sqlExists !== false);

        if (res.ok) {
          setIsAuthorized(true);
          return;
        }

        if (data.sqlExists === false) {
          return;
        }

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

  if (sqlExists === false) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="max-w-xl w-full rounded-large border border-default-200 bg-content1 p-6 md:p-8 shadow-sm">
          <h1 className="text-xl md:text-2xl font-semibold mb-3">{t("dbMissingTitle")}</h1>
          <p className="text-default-600 text-sm md:text-base mb-4">{t("dbMissingDescription")}</p>
          <pre className="bg-default-100 text-default-800 text-xs md:text-sm rounded-medium p-3 overflow-x-auto mb-4">
{`DATABASE_URL="postgres://..."`}
          </pre>
          <p className="text-default-500 text-xs md:text-sm mb-5">{t("dbMissingHint")}</p>
          <div className="flex flex-wrap gap-3">
            <Button
              as={Link}
              color="primary"
              href="https://github.com/Emiyaaaaa/fibofinance#readme"
              target="_blank"
            >
              {t("dbMissingDocs")}
            </Button>
            <Button variant="flat" onPress={() => window.location.reload()}>
              {t("dbMissingRetry")}
            </Button>
          </div>
        </div>
      </div>
    );
  }

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
