import { create } from "zustand";
import { useEffect } from "react";

import { useGroup } from "./useGroup";
import useFinanceData from "./useFinanceData";

import { FinanceChange, Finance } from "@/types";
import { CalendarDate, getLocalTimeZone, today } from "@internationalized/date";

export type FinanceChangeData = FinanceChange & {
  financeData: Finance[];
  date: string;
};

type StoreType = {
  data: FinanceChangeData[];
  filteredData: FinanceChangeData[];
  inited: boolean;
  updating: boolean;
  timeoutId?: NodeJS.Timeout | null;
  dateRange: {
    start: CalendarDate;
    end: CalendarDate;
  };
  setData: (data: StoreType["data"]) => void;
  setDateRange: (start: CalendarDate, end: CalendarDate) => void;
  initData: (group_id: number) => void;
  updateData: (group_id: number) => void;
  debounceUpdateData: (group_id: number) => void;
  filterDataByDateRange: () => void;
};

const useFinanceChangeDataStore = create<StoreType>((set, get) => ({
  data: [],
  filteredData: [],
  updating: true,
  inited: false,
  dateRange: {
    start: new CalendarDate(2025, 4, 1),
    end: today(getLocalTimeZone()),
  },
  setData: (data: StoreType["data"]) => {
    set({ data });
    get().filterDataByDateRange();
  },
  setDateRange: (start: CalendarDate, end: CalendarDate) => {
    set({
      dateRange: { start, end },
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

      const financeData = JSON.parse(item.finance_json);

      dataWithFinanceData.push({ ...item, financeData });
    });

    dataWithFinanceData.reverse();

    set({ data: dataWithFinanceData });
    set({ updating: false });
    get().filterDataByDateRange();
  },
  filterDataByDateRange: () => {
    const { data, dateRange } = get();

    if (!dateRange.start || !dateRange.end) {
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
    data: financeChangeDataStore.filteredData, // 返回过滤后的数据
    financeData,
  };
};

export default useFinanceChangeData;
