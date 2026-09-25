import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Difficulty, Question } from "@/lib/questions/types";
import type { BoardSize } from "./rules";

export const DEFAULT_NAMES: [string, string] = ["藍隊", "紅隊"];

/** 每題開搶前的倒數秒數；低年級要多一點時間看題 */
export const COUNTDOWNS = [3, 4, 5] as const;
export type Countdown = (typeof COUNTDOWNS)[number];

/**
 * 老師的題庫與玩法設定存在這台裝置；進行中的棋盤不存，重整就重來。
 * 題庫只存老師匯入的那份 —— 選「內建題庫」時 bank 留著，切回自訂還在。
 */
interface TerritoryStore {
  bank: Question[];
  /** true = 用內建題庫開場，不動 bank */
  useDefault: boolean;
  /** 全域難度上限：兩隊看同一題，沒有個人化的餘地 */
  cap: Difficulty;
  names: [string, string];
  countdown: Countdown;
  size: BoardSize;
  sound: boolean;
  setBank: (bank: Question[]) => void;
  setUseDefault: (v: boolean) => void;
  setCap: (cap: Difficulty) => void;
  setName: (index: 0 | 1, name: string) => void;
  setCountdown: (countdown: Countdown) => void;
  setSize: (size: BoardSize) => void;
  setSound: (v: boolean) => void;
}

export const useTerritoryStore = create<TerritoryStore>()(
  persist(
    (set, get) => ({
      bank: [],
      useDefault: true,
      cap: "hard",
      names: DEFAULT_NAMES,
      countdown: 3,
      size: "auto",
      sound: true,
      setBank: (bank) => set({ bank }),
      setUseDefault: (useDefault) => set({ useDefault }),
      setCap: (cap) => set({ cap }),
      setName: (index, name) => {
        const names = [...get().names] as [string, string];
        names[index] = name;
        set({ names });
      },
      setCountdown: (countdown) => set({ countdown }),
      setSize: (size) => set({ size }),
      setSound: (sound) => set({ sound }),
    }),
    { name: "territory-game" },
  ),
);
