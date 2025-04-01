import { create } from "zustand";
import { useEffect } from "react";

import { transformDate } from "../transformDate";

import { useGroup } from "./useGroup";
import useFinanceData from "./useFinanceData";

import { FinanceChange, Finance } from "@/types";

type StoreType = {
  data: (FinanceChange & { financeData: Finance[]; date: string })[];
  updating: boolean;
  updateData: (group_id: number) => void;
};

const useFinanceChangeDataStore = create<StoreType>((set) => ({
  data: [],
  updating: true,
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

      dataWithFinanceData.push({
        ...item,
        date,
        financeData: JSON.parse(item.finance_json),
      });
    });

    dataWithFinanceData.reverse();

    set({ data: dataWithFinanceData });
    set({ updating: false });
  },
}));

export const useFinanceChangeData = () => {
  const financeChangeDataStore = useFinanceChangeDataStore();
  const { data: financeData } = useFinanceData();
  const { groupId } = useGroup();

  useEffect(() => {
    if (!groupId) {
      return;
    }

    financeChangeDataStore.updateData(groupId);
    setTimeout(() => {
      financeChangeDataStore.updateData(groupId);
    }, 1000);
    setTimeout(() => {
      financeChangeDataStore.updateData(groupId);
    }, 2000);
    setTimeout(() => {
      financeChangeDataStore.updateData(groupId);
    }, 3000);
  }, [groupId, financeData]);

  return {
    ...financeChangeDataStore,
    financeData,
  };
};

export default useFinanceChangeData;
