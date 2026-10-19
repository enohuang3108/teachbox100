import type { QuestionDeck } from "@/lib/questions/deck";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Round } from "@/lib/ultimate-password/game";
import { adoptLegacyBank } from "@/lib/questions/library";
import type { Difficulty, Question } from "@/lib/questions/types";

/**
 * 老師選的題庫與難度存在這台裝置；密碼與範圍不存，重整就重來。
 * 題庫各遊戲共用（lib/questions/library），這裡只記選哪份，null 用內建。
 */
interface UltimatePasswordStore {
  bankId: string | null;
  cap: Difficulty;
  sound: boolean;
  selectBank: (id: string | null) => void;
  setCap: (cap: Difficulty) => void;
  setSound: (v: boolean) => void;
}

/** v0 自己存一份 bank：搬進共用題庫清單 */
export function migrateUltimatePassword(persisted: unknown, version: number) {
  const state = persisted as Record<string, unknown>;
  if (version >= 1) return state;
  const { bank, useDefault, ...rest } = state as { bank?: Question[]; useDefault?: boolean };
  const id = adoptLegacyBank("legacy-ultimate-password", "終極密碼自訂題庫", bank);
  return { ...rest, bankId: id && useDefault === false ? id : null };
}

export const useUltimatePasswordStore = create<UltimatePasswordStore>()(
  persist(
    (set) => ({
      bankId: null,
      cap: "hard",
      sound: true,
      selectBank: (bankId) => set({ bankId }),
      setCap: (cap) => set({ cap }),
      setSound: (sound) => set({ sound }),
    }),
    { name: "ultimate-password-game", version: 1, migrate: migrateUltimatePassword as never },
  ),
);

/**
 * 進行中的這一局。存 sessionStorage：投影時誤按重新整理不會重來，
 * 關掉分頁才清空 —— 下一堂課打開是新的一局。
 */
interface UltimatePasswordProgress {
  question: Question | null;
  questionDeck: QuestionDeck | null;
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
      questionDeck: null,
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
