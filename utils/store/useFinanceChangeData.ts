import { create } from "zustand";
import { useEffect } from "react";

import { transformDate } from "../transformDate";
import { getTotalFinance } from "../totalFinance";

import { useGroup } from "./useGroup";
import useFinanceData from "./useFinanceData";

import { FinanceChange, Finance } from "@/types";

type StoreType = {
  data: (FinanceChange & {
    financeData: Finance[];
    date: string;
    totalCny: number;
  })[];
  inited: boolean;
  updating: boolean;
  timeoutId?: NodeJS.Timeout | null;
  setData: (data: StoreType["data"]) => void;
  initData: (group_id: number) => void;
  updateData: (group_id: number) => void;
  debounceUpdateData: (group_id: number) => void;
};

const useFinanceChangeDataStore = create<StoreType>((set, get) => ({
  data: [],
  updating: true,
  inited: false,
  setData: (data: StoreType["data"]) => set({ data }),
  updateData: async (group_id: number) => {
    set({ updating: true });
    const res = await fetch(`/api/finance/changeData?group_id=${group_id}`);
    const data: FinanceChange[] = await res.json();

    const dataWithFinanceData: StoreType["data"] = [];

    // 日期去重
    data.forEach((item) => {
      const date = transformDate(new Date(item.created_at), "YYYY-MM-DD");

      if (date === dataWithFinanceData[dataWithFinanceData.length - 1]?.date) {
        return;
      }

      const financeData = JSON.parse(item.finance_json);

      dataWithFinanceData.push({
        ...item,
        date,
        totalCny: getTotalFinance(financeData, "CNY"),
        financeData,
      });
    });

    dataWithFinanceData.reverse();

    set({ data: dataWithFinanceData });
    set({ updating: false });
  },
  initData: (group_id: number) => {
    if (get().inited) {
      return;
    }

    get().updateData(group_id);
    set({ inited: true });
  },
  debounceUpdateData: (group_id: number) => {
    const timeoutId = get().timeoutId;

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    set({
      timeoutId: setTimeout(() => {
        if (get().inited) {
          get().updateData(group_id);
        }
      }, 300),
    });
  },
}));

export const useFinanceChangeData = () => {
  const financeChangeDataStore = useFinanceChangeDataStore();
  const { data: financeData } = useFinanceData();
  const { groupId, changed } = useGroup();

  useEffect(() => {
    financeChangeDataStore.setData([]);
  }, [groupId]);

  useEffect(() => {
    if (!groupId) {
      return;
    }

    financeChangeDataStore.debounceUpdateData(groupId);
  }, [groupId, changed, financeData]);

  return {
    ...financeChangeDataStore,
    financeData,
  };
};

export default useFinanceChangeData;
