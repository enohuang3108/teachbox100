import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Round } from "@/lib/ultimate-password/game";
import type { Difficulty, Question } from "@/lib/questions/types";

/**
 * 老師的題庫與難度存在這台裝置；密碼與範圍不存，重整就重來。
 * 選「內建題庫」時 bank 留著，切回自訂還在。
 */
interface UltimatePasswordStore {
  bank: Question[];
  /** true = 用內建題庫，不動 bank */
  useDefault: boolean;
  cap: Difficulty;
  sound: boolean;
  setBank: (bank: Question[]) => void;
  setUseDefault: (v: boolean) => void;
  setCap: (cap: Difficulty) => void;
  setSound: (v: boolean) => void;
}

export const useUltimatePasswordStore = create<UltimatePasswordStore>()(
  persist(
    (set) => ({
      bank: [],
      useDefault: true,
      cap: "hard",
      sound: true,
      setBank: (bank) => set({ bank }),
      setUseDefault: (useDefault) => set({ useDefault }),
      setCap: (cap) => set({ cap }),
      setSound: (sound) => set({ sound }),
    }),
    { name: "ultimate-password-game" },
  ),
);

/**
 * 進行中的這一局。存 sessionStorage：投影時誤按重新整理不會重來，
 * 關掉分頁才清空 —— 下一堂課打開是新的一局。
 */
interface UltimatePasswordProgress {
  question: Question | null;
  round: Round | null;
  /** 題目答對了，輪到猜密碼 */
  answerAccepted: boolean;
  numberGuess: number;
  /** 猜中時的密碼；null = 還在猜 */
  answerNumber: number | null;
}

export const useUltimatePasswordProgress = create<UltimatePasswordProgress>()(
  persist(
    (): UltimatePasswordProgress => ({
      question: null,
      round: null,
      answerAccepted: false,
      numberGuess: 50,
      answerNumber: null,
    }),
    {
      name: "ultimate-password-progress",
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);
