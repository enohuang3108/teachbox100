import { create } from "zustand";
import { persist } from "zustand/middleware";
import { STARTER_TEXT } from "./game";

// 老師的名單與偏好存在這台裝置；轉到一半的狀態不存，重整就重來。
interface WheelStore {
  text: string;
  removeOnPick: boolean;
  sound: boolean;
  setText: (text: string) => void;
  setRemoveOnPick: (v: boolean) => void;
  setSound: (v: boolean) => void;
  restoreStarter: () => void;
}

export const useWheelStore = create<WheelStore>()(
  persist(
    (set) => ({
      text: STARTER_TEXT,
      removeOnPick: false,
      sound: true,
      setText: (text) => set({ text }),
      setRemoveOnPick: (removeOnPick) => set({ removeOnPick }),
      setSound: (sound) => set({ sound }),
      restoreStarter: () => set({ text: STARTER_TEXT }),
    }),
    { name: "wheel-spinner" },
  ),
);
