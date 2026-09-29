import { create } from "zustand";
import { persist } from "zustand/middleware";
import { STARTER_FACES, type DiceMode } from "./game";

// 老師的顆數、骰面與音效存在這台裝置；擲出的結果不存，重整就重來。
interface DiceStore {
  count: number;
  mode: DiceMode;
  faces: string[];
  sound: boolean;
  setCount: (count: number) => void;
  setMode: (mode: DiceMode) => void;
  setFace: (index: number, text: string) => void;
  setSound: (sound: boolean) => void;
  restoreStarter: () => void;
}

export const useDiceStore = create<DiceStore>()(
  persist(
    (set) => ({
      count: 2,
      mode: "number",
      faces: STARTER_FACES,
      sound: true,
      setCount: (count) => set({ count }),
      setMode: (mode) => set({ mode }),
      setFace: (index, text) =>
        set((s) => ({ faces: s.faces.map((f, i) => (i === index ? text : f)) })),
      setSound: (sound) => set({ sound }),
      restoreStarter: () => set({ faces: STARTER_FACES }),
    }),
    { name: "dice" },
  ),
);
