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
  aiData: [
    {
      id: 6,
      name: "OCBC",
      amount: 6000,
    },
    {
      id: 5,
      name: "股票",
      amount: 5000,
    },
    {
      id: 2,
      name: "基金",
      amount: 23000,
    },
    {
      id: 4,
      name: "中国银行",
      amount: 56200,
    },
    {
      id: 3,
      name: "建设银行",
      amount: 23500,
    },
  ],
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
