import { create } from "zustand";
import { useCallback } from "react";

import { useGroup } from "./useGroup";

import { FinanceChange, Finance } from "@/types";
import { CalendarDate } from "@internationalized/date";
import { useFinanceExchangeRateDataStore } from "./useFinanceExchangeRateData";

export type FinanceChangeData = FinanceChange & {
  financeData: Finance[];
  date: string;
};

type StoreType = {
  data: FinanceChangeData[];
  filteredData: FinanceChangeData[];
  inited: boolean;
  updating: boolean;
  dateRange: {
    start: CalendarDate;
    end: CalendarDate;
  } | null;
  setData: (data: StoreType["data"]) => void;
  setDateRange: (dateRange: StoreType["dateRange"]) => void;
  initData: (group_id: number) => Promise<void>;
  updateData: (group_id: number) => Promise<void>;
  filterDataByDateRange: () => void;
};

const useFinanceChangeDataStore = create<StoreType>((set, get) => ({
  data: [],
  filteredData: [],
  updating: true,
  inited: false,
  dateRange: null,
  setData: (data: StoreType["data"]) => {
    set({ data });
    get().filterDataByDateRange();
  },
  setDateRange: (dateRange: StoreType["dateRange"]) => {
    if (!dateRange) {
      set({ dateRange });
      get().filterDataByDateRange();
      return;
    }

    const { start, end } = dateRange;

    // 如果开始时间大于结束时间，则不进行后续操作
    if (start.compare(end) > 0) {
      return;
    }
    set({
      dateRange,
    });
    get().filterDataByDateRange();
  },
  updateData: async (group_id: number) => {
    set({ updating: true });
    const res = await fetch(`/api/finance/changeData?group_id=${group_id}`);
    const data: FinanceChange[] = await res.json();

    const dataWithFinanceData: StoreType["data"] = [];

    // 去重
    data.forEach((item) => {
      // 日期去重
      if (item.date === dataWithFinanceData[dataWithFinanceData.length - 1]?.date) {
        return;
      }

      const financeData: Finance[] = JSON.parse(item.finance_json);
      const rowTs = new Date(item.date).getTime();

      // Fetch exchange rate history and compute amount_cny for each record using the closest prior rate
      // We cannot call hooks here; fetch the full rate list and compute locally
      // Note: This is inside a loop; to keep it simple and non-blocking, we'll compute after the loop

      dataWithFinanceData.push({ ...item, financeData });
    });

    dataWithFinanceData.reverse();

    // compute amount_cny for each entry using historical rates from shared store
    const exchangeRateStore = useFinanceExchangeRateDataStore.getState();

    dataWithFinanceData.forEach((entry) => {
      const ts = new Date(entry.date).getTime();
      const rate = exchangeRateStore.getRateForTimestamp(ts);
      entry.financeData = entry.financeData.map((f) => {
        const r = rate[f.currency] ?? 1;
        const amount_cny = f.currency === "CNY" ? f.amount : Math.round((f.amount / r) * 100) / 100;
        return { ...f, amount_cny };
      });
    });

    set({ data: dataWithFinanceData });
    set({ updating: false });
    get().filterDataByDateRange();
  },
  filterDataByDateRange: () => {
    const { data, dateRange } = get();

    if (!dateRange?.start || !dateRange.end) {
      set({ filteredData: data });
      return;
    }

    const filteredData = data.filter((item) => {
      // 将item.date转换为Date对象进行比较
      // item.date是通过toLocaleDateString()格式化的，需要正确解析
      const itemDate = new Date(item.date);
      const startDate = dateRange.start!.toDate("UTC");
      const endDate = dateRange.end!.toDate("UTC");

      // 确保日期比较时只比较日期部分，忽略时间
      const itemDateOnly = new Date(itemDate.getFullYear(), itemDate.getMonth(), itemDate.getDate());
      const startDateOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
      const endDateOnly = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());

      return itemDateOnly >= startDateOnly && itemDateOnly <= endDateOnly;
    });

    set({ filteredData });
  },
  initData: async (group_id: number) => {
    await get().updateData(group_id);
    set({ inited: true });
  },
}));

export const useFinanceChangeData = () => {
  const financeChangeDataStore = useFinanceChangeDataStore();
  const { groupId } = useGroup();

  const initData = useCallback(() => {
    if (!groupId) return;
    return financeChangeDataStore.initData(groupId);
  }, [groupId]);

  const updateData = useCallback(() => {
    if (!groupId) return;
    return financeChangeDataStore.updateData(groupId);
  }, [groupId]);

  return {
    ...financeChangeDataStore,
    data: financeChangeDataStore.filteredData, // 返回过滤后的数据
    initData,
    updateData,
  };
};

export default useFinanceChangeData;
