import { create } from "zustand";
import { useEffect } from "react";

import { DEFAULT_EXCHANGE_RATE } from "@/utils/exchangeRate";

type ExchangeRateRow = {
  id?: number;
  date?: string;
  created_at?: string;
  rates_json?: string;
  rates?: Record<string, number>;
};

interface FinanceExchangeRateDataStore {
  inited: boolean;
  fullData: ExchangeRateRow[] | null;
  latestData: Record<string, number> | null;
  setFullData: (fullData: ExchangeRateRow[]) => void;
  setLatestData: (latestData: Record<string, number>) => void;
  refreshLatestData: () => Promise<void>;
  refreshFullData: () => Promise<void>;
  getRateForTimestamp: (ts: number) => Record<string, number>;
  toCny: (amount: number, currency: string, rate?: Record<string, number>) => number;
  initData: () => void;
}

const useFinanceExchangeRateDataStore = create<FinanceExchangeRateDataStore>((set, get) => ({
  inited: false,
  fullData: null,
  latestData: null,

  setFullData: (fullData: ExchangeRateRow[]) => set({ fullData }),
  setLatestData: (latestData: Record<string, number>) => set({ latestData }),

  refreshLatestData: async () => {
    const res = await fetch(`/api/finance/exchangeRate/latest`);
    const data = await res.json();

    const latest =
      typeof data?.rates_json === "string" ? (JSON.parse(data.rates_json)?.rates ?? {}) : (data?.rates ?? {});
    set({ latestData: latest });
  },

  refreshFullData: async () => {
    const res = await fetch("/api/finance/exchangeRate");
    const rows: ExchangeRateRow[] = await res.json();
    // normalize: ensure each row has a timestamp for ordering and a parsed rates object
    const normalized = rows
      .map((row) => {
        const ts = row.date ? new Date(row.date).getTime() : row.created_at ? new Date(row.created_at).getTime() : 0;
        let rates: Record<string, number> = {};
        try {
          rates = row.rates ? row.rates : row.rates_json ? (JSON.parse(row.rates_json)?.rates ?? {}) : {};
        } catch {
          rates = {};
        }
        return {
          ...row,
          rates,
          created_at: row.created_at ?? new Date(ts).toISOString(),
          date: row.date ?? new Date(ts).toLocaleDateString(),
        };
      })
      .sort((a, b) => {
        const ta = a.created_at ? new Date(a.created_at).getTime() : 0;
        const tb = b.created_at ? new Date(b.created_at).getTime() : 0;
        return ta - tb;
      });

    set({ fullData: normalized });
  },

  getRateForTimestamp: (ts: number) => {
    const { fullData, latestData } = get();
    if (!fullData || fullData.length === 0) return latestData ?? DEFAULT_EXCHANGE_RATE.rates;

    let selected = DEFAULT_EXCHANGE_RATE.rates;
    for (let i = 0; i < fullData.length; i++) {
      const rowTs = fullData[i].created_at ? new Date(fullData[i].created_at!).getTime() : 0;
      if (rowTs <= ts) {
        selected = (fullData[i].rates as Record<string, number>) || selected;
      } else {
        break;
      }
    }
    return selected;
  },

  toCny: (amount: number, currency: string, rate?: Record<string, number>) => {
    const useRate = rate ?? get().latestData ?? DEFAULT_EXCHANGE_RATE.rates;
    if (currency === "CNY") return Math.round(amount * 100) / 100;
    const r = useRate[currency] ?? DEFAULT_EXCHANGE_RATE.rates[currency] ?? 1;
    // stored rate is currency-per-CNY, so CNY = amount / rate
    return Math.round((amount / r) * 100) / 100;
  },

  initData: () => {
    if (get().inited) {
      return;
    }

    get().refreshFullData();
    get().refreshLatestData();
    set({ inited: true });
  },
}));

export const useFinanceExchangeRateData = () => {
  const financeExchangeRateDataStore = useFinanceExchangeRateDataStore();

  useEffect(() => {
    financeExchangeRateDataStore.initData();
  }, []);

  return financeExchangeRateDataStore;
};

export default useFinanceExchangeRateData;
