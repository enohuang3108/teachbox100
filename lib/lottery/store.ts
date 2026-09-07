import { create } from "zustand";
import { persist } from "zustand/middleware";
import { STARTER_TEXT } from "./game";

// 老師的名單與偏好存在這台裝置；機器裡球的位置不存，重整就重來。
interface LotteryStore {
  text: string;
  sound: boolean;
  /** 抽到一顆就關蓋；關掉的話蓋子一直開著，球一顆接一顆出來，再點一下才關 */
  autoClose: boolean;
  setText: (text: string) => void;
  setSound: (v: boolean) => void;
  setAutoClose: (v: boolean) => void;
  restoreStarter: () => void;
}

export const useLotteryStore = create<LotteryStore>()(
  persist(
    (set) => ({
      text: STARTER_TEXT,
      sound: true,
      autoClose: true,
      setText: (text) => set({ text }),
      setSound: (sound) => set({ sound }),
      setAutoClose: (autoClose) => set({ autoClose }),
      restoreStarter: () => set({ text: STARTER_TEXT }),
    }),
    { name: "lottery-machine" },
  ),
);
