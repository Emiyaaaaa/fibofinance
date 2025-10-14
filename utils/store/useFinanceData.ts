import { create } from "zustand";
import { useCallback, useEffect } from "react";

import { useGroup } from "./useGroup";

import { Finance, AssetAdvice } from "@/types";
import { useFinanceExchangeRateData } from "./useFinanceExchangeRateData";

interface FinanceDataStore {
  orderBy: keyof Pick<Finance, "amount" | "updated_at">;
  order: "ASC" | "DESC";
  data: Finance[];
  updating: boolean;
  timeoutId?: NodeJS.Timeout | null;
  inited: boolean;
  aiData: AssetAdvice[];
  setData: (data: Finance[]) => void;
  updateData: (groupId: number) => Promise<void>;
  updateAiData: (data: AssetAdvice[]) => void;
  initData: (groupId: number) => void;
  debounceUpdateData: (groupId: number) => void;
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

    // compute amount_cny using latest rates
    try {
      // We cannot call hooks here; compute using a lightweight fetch to latest endpoint
      const rateRes = await fetch(`/api/finance/exchangeRate/latest`);
      const latest = await rateRes.json();
      const latestRates =
        typeof latest?.rates_json === "string" ? (JSON.parse(latest.rates_json)?.rates ?? {}) : (latest?.rates ?? {});

      const withCny: Finance[] = data.map((item) => {
        const rate = latestRates[item.currency] ?? latestRates[String(item.currency)] ?? 1;
        const amount_cny = item.currency === "CNY" ? item.amount : Math.round((item.amount / rate) * 100) / 100;
        return { ...item, amount_cny };
      });

      set({ data: withCny });
    } catch {
      set({ data });
    }
    set({ updating: false });
  },
  initData: (groupId: number) => {
    if (get().inited) {
      return;
    }

    get().updateData(groupId);
    set({ inited: true });
  },
  debounceUpdateData: (groupId: number) => {
    const timeoutId = get().timeoutId;

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    set({
      timeoutId: setTimeout(() => {
        if (get().inited) {
          get().updateData(groupId);
        }
      }, 300),
    });
  },
  updateAiData: (data) => set({ aiData: data }),
}));

export const useFinanceData = () => {
  const financeDataStore = useFinanceDataStore();
  const { groupId } = useGroup();

  useEffect(() => {
    if (groupId) {
      financeDataStore.updateData(groupId);
    }
  }, [groupId]);

  const updateData = useCallback(() => {
    if (!groupId) {
      return;
    }

    financeDataStore.updateData(groupId);
  }, [groupId]);

  return {
    ...financeDataStore,
    updateData,
  };
};

export default useFinanceData;
