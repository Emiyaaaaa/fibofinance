import { create } from "zustand";

const useRefresh = create<{
  refresh: number;
  onRefresh: () => void;
}>((set) => ({
  refresh: 0,
  onRefresh: () => set((state) => ({ refresh: state.refresh + 1 })),
}));

export default useRefresh;
