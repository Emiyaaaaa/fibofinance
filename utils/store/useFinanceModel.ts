import { create } from "zustand";

import { FinanceModelProps } from "@/types";

const useFinanceModel = create<{
  isOpen: boolean;
  modelProps: FinanceModelProps | null;
  onOpen: (modelProps?: FinanceModelProps) => void;
  onClose: () => void;
}>((set) => ({
  isOpen: false,
  modelProps: null,
  onOpen: (modelProps) => set({ isOpen: true, modelProps }),
  onClose: () => set({ isOpen: false, modelProps: null }),
}));

export default useFinanceModel;
