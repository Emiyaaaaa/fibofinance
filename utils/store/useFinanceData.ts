import { create } from "zustand";
import { useCallback, useEffect } from "react";

import { useGroup } from "./useGroup";

import { Finance, AssetAdvice } from "@/types";
import { useFinanceExchangeRateDataStore } from "./useFinanceExchangeRateData";
import { DEFAULT_EXCHANGE_RATE } from "../exchangeRate";

function applyCnyRates(data: Finance[], rates?: Record<string, number> | null): Finance[] {
  const latestRates = rates ?? DEFAULT_EXCHANGE_RATE.rates;
  return data.map((item) => {
    const rate = latestRates[item.currency] ?? latestRates[String(item.currency)] ?? 1;
    const amount_cny =
      item.currency === "CNY" ? Number(item.amount) : Math.round((Number(item.amount) / rate) * 100) / 100;
    return { ...item, amount_cny };
  });
}

interface FinanceDataStore {
  orderBy: keyof Pick<Finance, "amount" | "updated_at">;
  order: "ASC" | "DESC";
  rawData: Finance[];
  data: Finance[];
  updating: boolean;
  changing: boolean;
  groupId: number | undefined;
  inited: boolean;
  aiData: AssetAdvice[];
  setData: (data: Finance[]) => void;
  fetchData: (groupId: number) => Promise<void>;
  updateAiData: (data: AssetAdvice[]) => void;
  initData: (groupId: number) => void;
}

const useFinanceDataStore = create<FinanceDataStore>((set, get) => ({
  orderBy: "updated_at",
  order: "DESC",
  rawData: [],
  data: [],
  aiData: [],
  inited: false,
  updating: true,
  changing: false,
  groupId: undefined,
  setData: (data: Finance[]) => set({ data }),
  fetchData: async (groupId: number) => {
    set({ updating: true });
    const lastGroupId = get().groupId;
    if (lastGroupId !== groupId) {
      set({ changing: true, groupId });
    }

    const res = await fetch(`/api/finance?group_id=${groupId}&order_by=${get().orderBy}&order=${get().order}`);
    const rawData: Finance[] = await res.json();

    set({ rawData, data: applyCnyRates(rawData), updating: false, changing: false });
  },
  initData: (groupId: number) => {
    get().fetchData(groupId);
    set({ groupId, inited: true });
  },
  updateAiData: (data) => set({ aiData: data }),
}));

export const useFinanceData = () => {
  const financeDataStore = useFinanceDataStore();
  const { groupId } = useGroup();
  const rates = useFinanceExchangeRateDataStore((s) => s.latestRates);

  useEffect(() => {
    const { rawData } = useFinanceDataStore.getState();
    if (rawData.length === 0) return;
    useFinanceDataStore.setState({ data: applyCnyRates(rawData, rates) });
  }, [rates]);

  const updateData = useCallback(() => {
    if (!groupId) return;
    financeDataStore.fetchData(groupId);
  }, [groupId]);

  const initData = useCallback(() => {
    if (!groupId) return;
    financeDataStore.initData(groupId);
  }, [groupId]);

  return {
    ...financeDataStore,
    updateData,
    initData,
  };
};

export default useFinanceData;
