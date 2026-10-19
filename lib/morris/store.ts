import { create } from "zustand";
import { persist } from "zustand/middleware";
import { adoptLegacyBank } from "@/lib/questions/library";
import type { Difficulty, Question } from "@/lib/questions/types";

export const DEFAULT_NAMES: [string, string] = ["紅隊", "藍隊"];

interface MorrisStore {
  /** 選用的共用題庫；null 用內建 */
  bankId: string | null;
  cap: Difficulty;
  /** 固定順序為紅隊、藍隊。 */
  names: [string, string];
  sound: boolean;
  selectBank: (id: string | null) => void;
  setCap: (cap: Difficulty) => void;
  setName: (index: 0 | 1, name: string) => void;
  setSound: (value: boolean) => void;
}

/** v0 自己存一份 bank：搬進共用題庫清單 */
export function migrateMorris(persisted: unknown, version: number) {
  const state = persisted as Record<string, unknown>;
  if (version >= 1) return state;
  const { bank, useDefault, ...rest } = state as { bank?: Question[]; useDefault?: boolean };
  const id = adoptLegacyBank("legacy-morris", "圈叉搶答自訂題庫", bank);
  return { ...rest, bankId: id && useDefault === false ? id : null };
}

export const useMorrisStore = create<MorrisStore>()(
  persist(
    (set, get) => ({
      bankId: null,
      cap: "hard",
      names: DEFAULT_NAMES,
      sound: true,
      selectBank: (bankId) => set({ bankId }),
      setCap: (cap) => set({ cap }),
      setName: (index, name) => {
        const names = [...get().names] as [string, string];
        names[index] = name;
        set({ names });
      },
      setSound: (sound) => set({ sound }),
    }),
    { name: "morris-game", version: 1, migrate: migrateMorris as never },
  ),
);
