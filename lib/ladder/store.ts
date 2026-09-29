import { create } from "zustand";
import { persist } from "zustand/middleware";
import { STARTER_NAMES, STARTER_RESULTS, type LadderMode } from "./game";

// 名單、結果與偏好存在這台裝置；格子怎麼畫、誰爬過了不存，每次開始都重畫一張。
interface LadderStore {
  names: string;
  mode: LadderMode;
  results: string;
  groupCount: number;
  hideResults: boolean;
  sound: boolean;
  setNames: (names: string) => void;
  setMode: (mode: LadderMode) => void;
  setResults: (results: string) => void;
  setGroupCount: (groupCount: number) => void;
  setHideResults: (hideResults: boolean) => void;
  setSound: (sound: boolean) => void;
  restoreStarter: () => void;
}

export const useLadderStore = create<LadderStore>()(
  persist(
    (set) => ({
      names: STARTER_NAMES,
      mode: "custom",
      results: STARTER_RESULTS,
      groupCount: 2,
      hideResults: true,
      sound: true,
      setNames: (names) => set({ names }),
      setMode: (mode) => set({ mode }),
      setResults: (results) => set({ results }),
      setGroupCount: (groupCount) => set({ groupCount }),
      setHideResults: (hideResults) => set({ hideResults }),
      setSound: (sound) => set({ sound }),
      restoreStarter: () => set({ names: STARTER_NAMES, results: STARTER_RESULTS }),
    }),
    { name: "ladder" },
  ),
);
