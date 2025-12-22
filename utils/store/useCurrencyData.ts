import { create } from "zustand";
import { useEffect } from "react";

import { Currency } from "@/types";

interface CurrencyDataStore {
  data: Currency[];
  currencyMap: Record<string, { symbol: string; unit?: string }>;
  loading: boolean;
  inited: boolean;
  setData: (data: Currency[]) => void;
  updateData: () => Promise<void>;
  initData: () => void;
  addCurrency: (code: string, symbol: string, unit?: string) => Promise<void>;
  deleteCurrency: (id: number) => Promise<void>;
}

const useCurrencyDataStore = create<CurrencyDataStore>((set, get) => ({
  data: [],
  currencyMap: {},
  loading: true,
  inited: false,
  setData: (data: Currency[]) => {
    const currencyMap: Record<string, { symbol: string; unit?: string }> = {};
    data.forEach((item) => {
      currencyMap[item.code] = {
        symbol: item.symbol,
        unit: item.unit,
      };
    });
    set({ data, currencyMap });
  },
  updateData: async () => {
    set({ loading: true });
    try {
      const res = await fetch("/api/currency");
      const data: Currency[] = await res.json();
      get().setData(data);
    } catch (error) {
      console.error("Failed to fetch currencies:", error);
    } finally {
      set({ loading: false });
    }
  },
  initData: () => {
    if (get().inited) {
      return;
    }

    get().updateData();
    set({ inited: true });
  },
  addCurrency: async (code: string, symbol: string, unit?: string) => {
    try {
      const res = await fetch("/api/currency", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code, symbol, unit }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to add currency");
      }

      await get().updateData();
    } catch (error) {
      console.error("Failed to add currency:", error);
      throw error;
    }
  },
  deleteCurrency: async (id: number) => {
    try {
      const res = await fetch("/api/currency", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) {
        throw new Error("Failed to delete currency");
      }

      await get().updateData();
    } catch (error) {
      console.error("Failed to delete currency:", error);
      throw error;
    }
  },
}));

export const useCurrencyData = () => {
  const currencyDataStore = useCurrencyDataStore();

  useEffect(() => {
    currencyDataStore.initData();
  }, []);

  return currencyDataStore;
};

export default useCurrencyData;

