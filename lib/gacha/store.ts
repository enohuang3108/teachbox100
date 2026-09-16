import { create } from "zustand";
import { persist } from "zustand/middleware";
import { STARTER_TEXT } from "./game";

// 老師的名單與偏好存在這台裝置；機器裡球的位置不存，重整就重來。
interface GachaStore {
  text: string;
  sound: boolean;
  /** 揭曉後把扭蛋放回箱子（可能再被抽到）；關掉就收進抽籤紀錄、不再出現 */
  putBack: boolean;
  setText: (text: string) => void;
  setSound: (v: boolean) => void;
  setPutBack: (v: boolean) => void;
  restoreStarter: () => void;
}

export const useGachaStore = create<GachaStore>()(
  persist(
    (set) => ({
      text: STARTER_TEXT,
      sound: true,
      putBack: false,
      setText: (text) => set({ text }),
      setSound: (sound) => set({ sound }),
      setPutBack: (putBack) => set({ putBack }),
      restoreStarter: () => set({ text: STARTER_TEXT }),
    }),
    { name: "gacha-machine" },
  ),
);
