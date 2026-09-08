import { create } from "zustand";
import { persist } from "zustand/middleware";
import { TABLES } from "./multiplication";

export const QUESTION_COUNTS = [10, 20, 30] as const;

// 老師的出題設定存在這台裝置；答到一半的進度不存，重整就重來。
interface MultiplicationStore {
  tables: number[];
  count: number;
  sound: boolean;
  toggleTable: (n: number) => void;
  setAllTables: () => void;
  setCount: (n: number) => void;
  setSound: (v: boolean) => void;
}

export const useMultiplicationStore = create<MultiplicationStore>()(
  persist(
    (set) => ({
      tables: [...TABLES],
      count: 20,
      sound: true,
      toggleTable: (n) =>
        set((s) => ({
          tables: s.tables.includes(n)
            ? s.tables.filter((t) => t !== n)
            : [...s.tables, n].sort((a, b) => a - b),
        })),
      setAllTables: () => set({ tables: [...TABLES] }),
      setCount: (count) => set({ count }),
      setSound: (sound) => set({ sound }),
    }),
    { name: "multiplication-practice" },
  ),
);
