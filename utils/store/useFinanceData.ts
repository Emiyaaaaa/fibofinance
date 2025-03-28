import { create } from "zustand";
import { useCallback, useEffect } from "react";

import { useGroup } from "./useGroup";

import { Finance, AssetAdvice } from "@/types";

const useFinanceDataStore = create<{
  data: Finance[];
  updating: boolean;
  aiData: AssetAdvice[];
  updateData: (groupId: number) => Promise<void>;
  updateAiData: (data: AssetAdvice[]) => void;
}>((set) => ({
  data: [],
  aiData: [],
  updating: true,
  updateData: async (groupId: number) => {
    set({ updating: true });
    const res = await fetch(`/api/finance?group_id=${groupId}`);
    const data = await res.json();

    set({ data });
    set({ updating: false });
  },
  updateAiData: (data) => set({ aiData: data }),
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

  return {
    ...financeDataStore,
    updateData,
  };
};

export default useFinanceData;
