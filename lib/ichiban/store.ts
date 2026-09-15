import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  buildTicketPool,
  defaultIchibanPrizes,
  normalizePrizes,
  type IchibanPrize,
} from "./prizes";

interface IchibanStore {
  prizes: IchibanPrize[];
  /** 每一賞已確認抽出的張數，順序對應 prizes。 */
  drawn: number[];
  /** 還沒抽的票，每格是獎項索引（已洗牌）；輪播張數就是它的長度。 */
  pool: number[];
  setPrizes: (prizes: IchibanPrize[]) => void;
  /** 確認抽出輪播上第 ticketIndex 張票：從卡池移除並記入已抽張數。 */
  confirmDraw: (ticketIndex: number) => void;
  restoreDefaults: () => void;
}

// 獎項內容是老師的偏好，保存在目前這台裝置；每次撕票仍從頭開始。
export const useIchibanStore = create<IchibanStore>()(
  persist(
    (set) => ({
      prizes: defaultIchibanPrizes(),
      drawn: [],
      pool: buildTicketPool(defaultIchibanPrizes()),
      // 改獎項設定等於換一套籤，已抽張數歸零、卡池重洗。
      setPrizes: (prizes) => {
        const normalized = normalizePrizes(prizes);
        set({ prizes: normalized, drawn: [], pool: buildTicketPool(normalized) });
      },
      confirmDraw: (ticketIndex) =>
        set(({ prizes, drawn, pool }) => {
          const prizeIndex = pool[ticketIndex];
          if (prizeIndex === undefined) return {};
          const next = prizes.map((_, i) => drawn[i] ?? 0);
          next[prizeIndex] += 1;
          return { drawn: next, pool: pool.filter((_, i) => i !== ticketIndex) };
        }),
      restoreDefaults: () => {
        const prizes = defaultIchibanPrizes();
        set({ prizes, drawn: [], pool: buildTicketPool(prizes) });
      },
    }),
    {
      name: "ichiban-prizes",
      version: 2,
      migrate: (persistedState) => {
        const saved = persistedState as Partial<IchibanStore>;
        const prizes = normalizePrizes(saved.prizes ?? []);
        const drawn = saved.drawn ?? [];
        return { ...saved, prizes, drawn, pool: saved.pool ?? buildTicketPool(prizes, drawn) };
      },
    },
  ),
);
