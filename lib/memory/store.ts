import { create } from "zustand";
import { persist } from "zustand/middleware";
import { STARTER_DECK, type PairGroup } from "./game";

// 老師的牌組與偏好存在這台裝置；進行中的盤面不存，重整就重來。
interface MemoryStore {
  deck: PairGroup[];
  preview: boolean;
  sound: boolean;
  /** 卡背樣式，CARD_BACKS 的 id */
  back: string;
  setDeck: (deck: PairGroup[]) => void;
  setPreview: (v: boolean) => void;
  setSound: (v: boolean) => void;
  setBack: (v: string) => void;
  restoreStarter: () => void;
}

export const useMemoryStore = create<MemoryStore>()(
  persist(
    (set) => ({
      deck: STARTER_DECK,
      preview: false,
      sound: true,
      back: "barkley",
      setDeck: (deck) => set({ deck }),
      setPreview: (preview) => set({ preview }),
      setSound: (sound) => set({ sound }),
      setBack: (back) => set({ back }),
      restoreStarter: () => set({ deck: STARTER_DECK }),
    }),
    { name: "memory-game" },
  ),
);
