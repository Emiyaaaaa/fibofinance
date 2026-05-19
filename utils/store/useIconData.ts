import { create } from "zustand";

import { Icon } from "@/types";

interface IconDataStore {
  data: Icon[];
  iconMap: Record<string, Icon>;
  loading: boolean;
  inited: boolean;
  setData: (data: Icon[]) => void;
  updateData: () => Promise<void>;
  initData: () => void;
  addIcon: (key: string, svg: string, name?: string) => Promise<void>;
  updateIcon: (key: string, svg: string, name?: string) => Promise<void>;
  deleteIcon: (key: string) => Promise<{ wasUsed?: boolean }>;
  checkIconUsage: (key: string) => Promise<boolean | undefined>;
}

const buildIconMap = (data: Icon[]): Record<string, Icon> => {
  const map: Record<string, Icon> = {};
  data.forEach((item) => {
    map[item.key] = item;
  });
  return map;
};

const useIconDataStore = create<IconDataStore>((set, get) => ({
  data: [],
  iconMap: {},
  loading: false,
  inited: false,
  setData: (data: Icon[]) => {
    set({ data, iconMap: buildIconMap(data) });
  },
  updateData: async () => {
    set({ loading: true });
    try {
      const res = await fetch("/api/icons");
      const data: Icon[] = await res.json();
      get().setData(data);
    } catch (error) {
      console.error("Failed to fetch icons:", error);
    } finally {
      set({ loading: false });
    }
  },
  initData: () => {
    if (get().inited) {
      return;
    }
    set({ inited: true });
    get().updateData();
  },
  addIcon: async (key: string, svg: string, name?: string) => {
    const res = await fetch("/api/icons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, svg, name: name || key }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || "Failed to add icon");
    }

    await get().updateData();
  },
  updateIcon: async (key: string, svg: string, name?: string) => {
    const res = await fetch("/api/icons", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, svg, name: name || key }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || "Failed to update icon");
    }

    await get().updateData();
  },
  deleteIcon: async (key: string) => {
    const res = await fetch("/api/icons", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || "Failed to delete icon");
    }

    const result = await res.json().catch(() => ({}));
    await get().updateData();
    return { wasUsed: result?.wasUsed };
  },
  checkIconUsage: async (key: string) => {
    try {
      const res = await fetch(`/api/icons/${key}/usage`);
      if (res.ok) {
        const result = await res.json();
        return result.isUsed;
      }
    } catch (error) {
      console.error("Failed to check icon usage:", error);
    }
    return undefined;
  },
}));

export const useIconData = () => {
  const iconDataStore = useIconDataStore();
  return iconDataStore;
};

export { useIconDataStore };

export default useIconData;
