import { create } from "zustand";
import { useCallback } from "react";

import { useGroup } from "./useGroup";

import { Finance, AssetAdvice } from "@/types";
import { useFinanceExchangeRateDataStore } from "./useFinanceExchangeRateData";
import { DEFAULT_EXCHANGE_RATE } from "../exchangeRate";

interface FinanceDataStore {
  orderBy: keyof Pick<Finance, "amount" | "updated_at">;
  order: "ASC" | "DESC";
  data: Finance[];
  updating: boolean;
  inited: boolean;
  aiData: AssetAdvice[];
  setData: (data: Finance[]) => void;
  updateData: (groupId: number) => Promise<void>;
  updateAiData: (data: AssetAdvice[]) => void;
  initData: (groupId: number) => void;
}

const useFinanceDataStore = create<FinanceDataStore>((set, get) => ({
  orderBy: "updated_at",
  order: "DESC",
  data: [],
  aiData: [],
  inited: false,
  updating: true,
  setData: (data: Finance[]) => set({ data }),
  updateData: async (groupId: number) => {
    set({ updating: true });
    const res = await fetch(`/api/finance?group_id=${groupId}&order_by=${get().orderBy}&order=${get().order}`);
    const data: Finance[] = await res.json();

    // compute amount_cny using latest rates from shared store
    const latestRates = useFinanceExchangeRateDataStore.getState().latestRates ?? DEFAULT_EXCHANGE_RATE.rates;

    const withCny: Finance[] = data.map((item) => {
      const rate = latestRates[item.currency] ?? latestRates[String(item.currency)] ?? 1;
      const amount_cny =
        item.currency === "CNY" ? Number(item.amount) : Math.round((Number(item.amount) / rate) * 100) / 100;
      return { ...item, amount_cny };
    });

    set({ data: withCny });
    set({ updating: false });
  },
  initData: (groupId: number) => {
    get().updateData(groupId);
    set({ inited: true });
  },
  updateAiData: (data) => set({ aiData: data }),
}));

export const useFinanceData = () => {
  const financeDataStore = useFinanceDataStore();
  const { groupId } = useGroup();

  const updateData = useCallback(() => {
    if (!groupId) {
      return;
    }

    financeDataStore.updateData(groupId);
  }, [groupId]);

  const initData = useCallback(() => {
    if (!groupId) {
      return;
    }

    financeDataStore.initData(groupId);
  }, [groupId]);

  return {
    ...financeDataStore,
    updateData,
    initData,
  };
};

export default useFinanceData;
