import { create } from "zustand";

import { Finance } from "@/types";

const useAiFinanceData = create<{
  data: Pick<Finance, "name" | "amount" | "currency">[];
  updateData: (data: Pick<Finance, "name" | "amount" | "currency">[]) => void;
}>((set) => ({
  data: [],
  updateData: (data) => set({ data }),
}));

export default useAiFinanceData;
