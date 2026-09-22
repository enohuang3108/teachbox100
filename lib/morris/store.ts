import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Difficulty, Question } from "@/lib/questions/types";

export const DEFAULT_NAMES: [string, string] = ["紅隊", "藍隊"];

interface MorrisStore {
  bank: Question[];
  useDefault: boolean;
  cap: Difficulty;
  /** 固定順序為紅隊、藍隊。 */
  names: [string, string];
  sound: boolean;
  setBank: (bank: Question[]) => void;
  setUseDefault: (value: boolean) => void;
  setCap: (cap: Difficulty) => void;
  setName: (index: 0 | 1, name: string) => void;
  setSound: (value: boolean) => void;
}

export const useMorrisStore = create<MorrisStore>()(
  persist(
    (set, get) => ({
      bank: [],
      useDefault: true,
      cap: "hard",
      names: DEFAULT_NAMES,
      sound: true,
      setBank: (bank) => set({ bank }),
      setUseDefault: (useDefault) => set({ useDefault }),
      setCap: (cap) => set({ cap }),
      setName: (index, name) => {
        const names = [...get().names] as [string, string];
        names[index] = name;
        set({ names });
      },
      setSound: (sound) => set({ sound }),
    }),
    { name: "morris-game" },
  ),
);
