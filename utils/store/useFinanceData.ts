import { create } from "zustand";
import { useCallback, useEffect } from "react";

import { useGroup } from "./useGroup";

import { Finance, AssetAdvice } from "@/types";

interface FinanceDataStore {
  orderBy: keyof Pick<Finance, "created_at" | "amount">;
  order: "ASC" | "DESC";
  data: Finance[];
  updating: boolean;
  aiData: AssetAdvice[];
  updateData: (groupId: number) => Promise<void>;
  updateAiData: (data: AssetAdvice[]) => void;
  toggleOrder: () => void;
  setOrderBy: (orderBy: FinanceDataStore["orderBy"]) => void;
}

const useFinanceDataStore = create<FinanceDataStore>((set, get) => ({
  orderBy: "created_at",
  order: "DESC",
  data: [],
  aiData: [],
  updating: true,
  updateData: async (groupId: number) => {
    set({ updating: true });
    const res = await fetch(
      `/api/finance?group_id=${groupId}&order_by=${get().orderBy}&order=${get().order}`
    );
    const data = await res.json();

    set({ data });
    set({ updating: false });
  },
  updateAiData: (data) => set({ aiData: data }),
  toggleOrder: () => {
    set((state) => ({
      order: state.order === "ASC" ? "DESC" : "ASC",
    }));
  },
  setOrderBy: (orderBy) => {
    set({ orderBy });
    set({ order: "DESC" });
  },
}));

export const useFinanceData = () => {
  const financeDataStore = useFinanceDataStore();
  const { groupId } = useGroup();

  useEffect(() => {
    updateData();
  }, [groupId]);

  const updateData = useCallback(() => {
    if (!groupId) {
      return;
    }

    financeDataStore.updateData(groupId);
  }, [groupId]);

  const setOrderBy = useCallback((orderBy: FinanceDataStore["orderBy"]) => {
    financeDataStore.setOrderBy(orderBy);
    updateData();
  }, []);

  const toggleOrder = useCallback(() => {
    financeDataStore.toggleOrder();
    updateData();
  }, []);

  return {
    ...financeDataStore,
    updateData,
    setOrderBy,
    toggleOrder,
  };
};

export default useFinanceData;
