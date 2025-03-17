import { create } from "zustand";

import { FinanceChange } from "@/types";

const useFinanceChangeData = create<{
  data: FinanceChange[];
  initializing: boolean;
  updateData: () => void;
}>((set) => ({
  data: [],
  initializing: true,
  updateData: async () => {
    const res = await fetch("/api/changeData");
    const data = await res.json();

    set({ data });
    set({ initializing: false });
  },
}));

export default useFinanceChangeData;
