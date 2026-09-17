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
  /** 跟 pool 同長、同步移除：每張票建立時就定下的票色，抽走別張也不會換色。 */
  colors: number[];
  setPrizes: (prizes: IchibanPrize[]) => void;
  /** 確認抽出輪播上第 ticketIndex 張票：從卡池移除並記入已抽張數。 */
  confirmDraw: (ticketIndex: number) => void;
  restoreDefaults: () => void;
  sound: boolean;
  setSound: (sound: boolean) => void;
}

/** 洗好的卡池依序輪四套票色；之後只刪不重排，顏色就跟著票走 */
const fresh = (pool: number[]) => ({ pool, colors: pool.map((_, i) => i % 4) });

// 獎項內容是老師的偏好，保存在目前這台裝置；每次撕票仍從頭開始。
export const useIchibanStore = create<IchibanStore>()(
  persist(
    (set) => ({
      prizes: defaultIchibanPrizes(),
      drawn: [],
      ...fresh(buildTicketPool(defaultIchibanPrizes())),
      sound: true,
      setSound: (sound) => set({ sound }),
      // 改獎項設定等於換一套籤，已抽張數歸零、卡池重洗。
      setPrizes: (prizes) => {
        const normalized = normalizePrizes(prizes);
        set({
          prizes: normalized,
          drawn: [],
          ...fresh(buildTicketPool(normalized)),
        });
      },
      confirmDraw: (ticketIndex) =>
        set(({ prizes, drawn, pool, colors }) => {
          const prizeIndex = pool[ticketIndex];
          if (prizeIndex === undefined) return {};
          const next = prizes.map((_, i) => drawn[i] ?? 0);
          next[prizeIndex] += 1;
          return {
            drawn: next,
            pool: pool.filter((_, i) => i !== ticketIndex),
            colors: colors.filter((_, i) => i !== ticketIndex),
          };
        }),
      restoreDefaults: () => {
        const prizes = defaultIchibanPrizes();
        set({ prizes, drawn: [], ...fresh(buildTicketPool(prizes)) });
      },
    }),
    {
      name: "ichiban-prizes",
      version: 3,
      migrate: (persistedState) => {
        const saved = persistedState as Partial<IchibanStore>;
        const prizes = normalizePrizes(saved.prizes ?? []);
        const drawn = saved.drawn ?? [];
        const pool = saved.pool ?? buildTicketPool(prizes, drawn);
        const colors =
          saved.colors?.length === pool.length
            ? saved.colors
            : fresh(pool).colors;
        return { ...saved, prizes, drawn, pool, colors };
      },
    },
  ),
);
