import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  DEFAULT_SLOTS,
  DEFAULT_WARN_MIN,
  EXAM_STORAGE_KEY,
  EXAM_WARN_KEY,
  isoDate,
  type ExamSlot,
} from "./exam";
import type { TimerMode, TimerSetup } from "./share";

// 模式、倒數長度、考試時間表與音效存在這台裝置；倒數到哪不存，重整就重來。
interface TimerStore extends TimerSetup {
  sound: boolean;
  setMode: (mode: TimerMode) => void;
  setSeconds: (seconds: number) => void;
  setDate: (date: string) => void;
  setSlots: (slots: ExamSlot[]) => void;
  setWarnMin: (warnMin: number) => void;
  setSound: (sound: boolean) => void;
}

/** 考試時間表以前各自存在兩個 key，第一次載入時搬過來，老師排好的課表不會不見 */
function legacyExam(): Pick<TimerSetup, "slots" | "warnMin"> {
  const fallback = { slots: DEFAULT_SLOTS, warnMin: DEFAULT_WARN_MIN };
  if (typeof localStorage === "undefined") return fallback;
  try {
    const slots = JSON.parse(localStorage.getItem(EXAM_STORAGE_KEY) ?? "null");
    const warnMin = Number(localStorage.getItem(EXAM_WARN_KEY));
    return {
      slots: Array.isArray(slots) && slots.length ? slots : fallback.slots,
      warnMin: warnMin > 0 ? warnMin : fallback.warnMin,
    };
  } catch {
    return fallback;
  }
}

export const useTimerStore = create<TimerStore>()(
  persist(
    (set) => ({
      mode: "timer",
      seconds: 300,
      date: isoDate(new Date()),
      ...legacyExam(),
      sound: true,
      setMode: (mode) => set({ mode }),
      setSeconds: (seconds) => set({ seconds }),
      setDate: (date) => set({ date }),
      setSlots: (slots) => set({ slots }),
      setWarnMin: (warnMin) => set({ warnMin }),
      setSound: (sound) => set({ sound }),
    }),
    { name: "timer" },
  ),
);
