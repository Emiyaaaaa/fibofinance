import { create } from "zustand";

import { Finance, AssetAdvice } from "@/types";

const useFinanceData = create<{
  data: Finance[];
  initializing: boolean;
  updating: boolean;
  aiData: AssetAdvice[];
  updateData: () => void;
  updateAiData: (data: AssetAdvice[]) => void;
}>((set) => ({
  data: [],
  aiData: [],
  initializing: true,
  updating: false,
  updateData: async () => {
    set({ updating: true });
    const res = await fetch("/api/finance");
    const data = await res.json();

    set({ data });
    set({ initializing: false });
    set({ updating: false });
  },
  updateAiData: (data) => set({ aiData: data }),
}));

export default useFinanceData;
