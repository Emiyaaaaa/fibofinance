import { create } from "zustand";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { addToast } from "@heroui/toast";
import { useTranslations } from "next-intl";

import { FinanceGroup } from "@/types";

type GroupStore = {
  inited: boolean;
  groupId: number | undefined;
  changed: number;
  groupList: FinanceGroup[];
  timeoutId?: NodeJS.Timeout | null;
  setGroupId: (id: number) => void;
  setChanged: () => void;
  setGroupList: (list: FinanceGroup[]) => void;
  updateData: () => Promise<FinanceGroup[]>;
  initData: () => void;
  debounceUpdateData: () => void;
};

export const useGroupStore = create<GroupStore>((set, get) => ({
  inited: false,
  groupId: undefined,
  groupList: [],
  changed: 0,
  setChanged: () => set({ changed: get().changed + 1 }),
  setGroupId: (id) => set({ groupId: id }),
  setGroupList: (list) => set({ groupList: list }),
  updateData: async () => {
    try {
      const res = await fetch("/api/finance/group");
      const data = await res.json();

      set({ groupList: data });

      return data;
    } catch (error) {
      console.error("Failed to fetch group list:", error);
    }
  },
  initData: () => {
    if (get().inited) {
      return;
    }

    get()
      .updateData()
      .then((data) => {
        const defaultGroup = data.find((group) => group.is_default);

        if (defaultGroup && get().groupId === undefined) {
          set({ groupId: defaultGroup.id });
        }
      })
      .finally(() => {
        set({ inited: true });
      });
  },
  debounceUpdateData: () => {
    const timeoutId = get().timeoutId;

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    set({
      timeoutId: setTimeout(() => {
        if (get().inited) {
          get().updateData();
        }
      }, 300),
    });
  },
}));

// 创建一个 hook 来处理路由和初始化逻辑
export const useGroup = () => {
  const { groupId, groupList, setGroupId, setGroupList, setChanged, changed, debounceUpdateData, initData } =
    useGroupStore();
  const query = useSearchParams();
  const router = useRouter();
  const t = useTranslations("home");

  // 初始化 groupId
  useEffect(() => {
    const queryGroupId = query.get("group_id");

    if (queryGroupId) {
      setGroupId(Number(queryGroupId));
    }
  }, []);

  const changeGroup = (newGroupId: number) => {
    setGroupId(newGroupId);
    setChanged();
    addToast({
      color: "success",
      description: t("changeGroupSuccess", {
        groupName: groupList.find((group) => group.id === newGroupId)?.name,
      }),
    });
    router.push(`?group_id=${newGroupId}`);
  };

  const refreshGroupList = () => {
    debounceUpdateData();
  };

  return {
    groupId,
    groupList,
    changeGroup,
    setGroupList,
    changed,
    setGroupId,
    initData,
    refreshGroupList,
  };
};
