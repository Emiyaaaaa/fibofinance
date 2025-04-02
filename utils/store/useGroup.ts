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
  fetchGroupList: () => Promise<FinanceGroup[]>;
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

      return data;
    } catch (error) {
      console.error("Failed to fetch group list:", error);
    }
  },
}));

// 创建一个 hook 来处理路由和初始化逻辑
export const useGroup = () => {
  const { groupId, groupList, setGroupId, fetchGroupList, setGroupList } =
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

  // 初始化 groupList
  useEffect(() => {
    fetchGroupList().then((data) => {
      const defaultGroup = data.find((group) => group.is_default);

      if (defaultGroup) {
        setGroupId(defaultGroup.id);
      }
    });
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
    setGroupList,
  };
};
