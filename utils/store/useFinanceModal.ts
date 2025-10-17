import { create } from "zustand";

import { FinanceModalProps } from "@/types";

const useFinanceModal = create<{
  isOpen: boolean;
  modalProps: FinanceModalProps | null;
  onOpen: (modalProps?: FinanceModalProps) => void;
  onClose: () => void;
}>((set) => ({
  isOpen: false,
  modalProps: null,
  onOpen: (modalProps) => {
    set({ isOpen: true, modalProps });
  },
  onClose: () => set({ isOpen: false, modalProps: null }),
}));

export default useFinanceModal;
