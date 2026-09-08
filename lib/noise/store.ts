import { create } from "zustand";
import { persist } from "zustand/middleware";

export const DEFAULT_LIMIT = 65;

// 門檻是老師依自己班級調出來的，存在這台裝置；音量讀數本身不存。
interface NoiseStore {
  limit: number;
  setLimit: (v: number) => void;
}

export const useNoiseStore = create<NoiseStore>()(
  persist(
    (set) => ({
      limit: DEFAULT_LIMIT,
      setLimit: (limit) => set({ limit: Math.min(95, Math.max(20, limit)) }),
    }),
    { name: "noise-meter" },
  ),
);
