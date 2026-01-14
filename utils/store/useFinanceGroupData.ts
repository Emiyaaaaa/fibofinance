import { useEffect } from "react";
import { create } from "zustand";

type StoreType = {
  data: { id: number; name: string }[];
  loading: boolean;
  inited: boolean;
  setData: (data: StoreType["data"]) => void;
  refresh: () => void;
  initData: () => void;
};

const useFinanceGroupDataStore = create<StoreType>((set, get) => ({
  data: [],
  loading: true,
  inited: false,
  setData: (data: StoreType["data"]) => set({ data }),
  refresh: async () => {
    set({ loading: true });
    const res = await fetch(`/api/finance/group`);
    const data: { id: number; name: string }[] = await res.json();

    set({ data });
    set({ loading: false });
  },
  initData: () => {
    if (get().inited) {
      return;
    }

    get().refresh();
    set({ inited: true });
  },
}));

export const useFinanceGroupData = () => {
  const financeGroupDataStore = useFinanceGroupDataStore();

  return financeGroupDataStore;
};

export default useFinanceGroupData;
