import { create } from "zustand";
import { persist } from "zustand/middleware";
import { adoptLegacyBank } from "@/lib/questions/library";
import { useSpeechStore, type SpeechPreferences } from "@/lib/questions/speech";
import type { Difficulty, Question } from "@/lib/questions/types";
import type { BoardSize } from "./rules";

export const DEFAULT_NAMES: [string, string] = ["藍隊", "紅隊"];

/** 每題開搶前的倒數秒數；低年級要多一點時間看題 */
export const COUNTDOWNS = [3, 4, 5] as const;
export type Countdown = (typeof COUNTDOWNS)[number];

/**
 * 老師的玩法設定存在這台裝置；進行中的棋盤不存，重整就重來。
 * 題庫與朗讀偏好各遊戲共用（lib/questions），這裡只記選哪份題庫，null 用內建。
 */
interface TerritoryStore {
  bankId: string | null;
  /** 全域難度上限：兩隊看同一題，沒有個人化的餘地 */
  cap: Difficulty;
  names: [string, string];
  countdown: Countdown;
  size: BoardSize;
  sound: boolean;
  selectBank: (id: string | null) => void;
  setCap: (cap: Difficulty) => void;
  setName: (index: 0 | 1, name: string) => void;
  setCountdown: (countdown: Countdown) => void;
  setSize: (size: BoardSize) => void;
  setSound: (v: boolean) => void;
}

/** v0 自己存一份 bank 與朗讀偏好：題庫搬進共用清單，朗讀偏好搬進共用設定 */
export function migrateTerritory(persisted: unknown, version: number) {
  const state = persisted as Record<string, unknown>;
  if (version >= 1) return state;
  const { bank, useDefault, reading, speechRate, voiceURI, ...rest } = state as {
    bank?: Question[];
    useDefault?: boolean;
  } & Partial<SpeechPreferences>;
  // 只搬有存的欄位；缺語速時寫進 undefined 會讓朗讀計時變 NaN
  const speech = Object.fromEntries(
    Object.entries({ reading, speechRate, voiceURI }).filter(([, v]) => v !== undefined),
  );
  if (Object.keys(speech).length) useSpeechStore.setState(speech);
  const id = adoptLegacyBank("legacy-territory", "領地戰自訂題庫", bank);
  return { ...rest, bankId: id && useDefault === false ? id : null };
}

export const useTerritoryStore = create<TerritoryStore>()(
  persist(
    (set, get) => ({
      bankId: null,
      cap: "hard",
      names: DEFAULT_NAMES,
      countdown: 3,
      size: "auto",
      sound: true,
      selectBank: (bankId) => set({ bankId }),
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
    { name: "territory-game", version: 1, migrate: migrateTerritory as never },
  ),
);
