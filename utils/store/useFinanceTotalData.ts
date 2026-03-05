import { create } from "zustand";
import { useEffect } from "react";

import { Finance } from "@/types";
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

interface FinanceTotalDataStore {
  rawData: Finance[];
  data: Finance[];
  updating: boolean;
  inited: boolean;
  setData: (data: Finance[]) => void;
  fetchData: () => Promise<void>;
  initData: () => void;
}

const useFinanceTotalDataStore = create<FinanceTotalDataStore>((set, get) => ({
  rawData: [],
  data: [],
  inited: false,
  updating: true,
  setData: (data: Finance[]) => set({ data }),
  fetchData: async () => {
    set({ updating: true });

    const res = await fetch(`/api/finance`);
    const rawData: Finance[] = await res.json();

    set({ rawData, data: applyCnyRates(rawData), updating: false });
  },
  initData: () => {
    get().fetchData();
    set({ inited: true });
  },
}));

export const useFinanceTotalData = () => {
  const store = useFinanceTotalDataStore();
  const latestRates = useFinanceExchangeRateDataStore((s) => s.latestRates);

  useEffect(() => {
    const { rawData } = useFinanceTotalDataStore.getState();
    if (rawData.length === 0) return;
    useFinanceTotalDataStore.setState({ data: applyCnyRates(rawData, latestRates) });
  }, [latestRates]);

  return store;
};

export default useFinanceTotalDataStore;
