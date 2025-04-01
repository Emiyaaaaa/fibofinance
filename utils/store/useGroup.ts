import { create } from "zustand";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { addToast } from "@heroui/toast";
import { useTranslations } from "next-intl";

import { FinanceGroup } from "@/types";

type GroupStore = {
  groupId: number | undefined;
  groupList: FinanceGroup[];
  setGroupId: (id: number) => void;
  setGroupList: (list: FinanceGroup[]) => void;
  fetchGroupList: () => Promise<void>;
};

export const useGroupStore = create<GroupStore>((set) => ({
  groupId: undefined,
  groupList: [],
  setGroupId: (id) => set({ groupId: id }),
  setGroupList: (list) => set({ groupList: list }),
  fetchGroupList: async () => {
    try {
      const res = await fetch("/api/finance/group");
      const data = await res.json();

      set({ groupList: data });
    } catch (error) {
      console.error("Failed to fetch group list:", error);
    }
  },
}));

// 创建一个 hook 来处理路由和初始化逻辑
export const useGroup = () => {
  const { groupId, groupList, setGroupId, fetchGroupList } = useGroupStore();
  const query = useSearchParams();
  const router = useRouter();
  const t = useTranslations("home");

  // 初始化 groupId
  useEffect(() => {
    const queryGroupId = query.get("group_id");

    setGroupId(queryGroupId ? Number(queryGroupId) : 1);
  }, []);

  // 初始化 groupList
  useEffect(() => {
    fetchGroupList();
  }, []);

  const changeGroup = (newGroupId: number) => {
    setGroupId(newGroupId);
    addToast({
      color: "success",
      description: t("changeGroupSuccess", {
        groupName: groupList.find((group) => group.id === newGroupId)?.name,
      }),
    });
    router.push(`?group_id=${newGroupId}`);
  };

  const refreshGroupList = () => {
    fetchGroupList();
  };

  return {
    groupId,
    groupList,
    changeGroup,
    refreshGroupList,
  };
};
