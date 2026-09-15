export interface IchibanPrize {
  rank: string;
  name: string;
  quantity: number;
}

export const ICHIBAN_RANKS = [..."ABCDEFGHIJKLM"].map((letter) => `${letter}賞`);

export const DEFAULT_ICHIBAN_PRIZES: IchibanPrize[] = [
  { rank: "A賞", name: "星空投影燈", quantity: 1 },
  { rank: "B賞", name: "造型抱枕", quantity: 3 },
  { rank: "C賞", name: "桌上收納盒", quantity: 3 },
];

const copyDefaults = () => DEFAULT_ICHIBAN_PRIZES.map((prize) => ({ ...prize }));

/** 移除輸入多餘空白；避免舊資料或手動寫入造成空白票券。 */
export function normalizePrizes(prizes: IchibanPrize[]): IchibanPrize[] {
  const valid = prizes
    .map((prize) => ({
      rank: ICHIBAN_RANKS.includes(prize.rank.trim()) ? prize.rank.trim() : prize.rank.trim() && ICHIBAN_RANKS[0],
      name: prize.name.trim(),
      quantity: Math.min(99, Math.max(1, Math.round(Number(prize.quantity) || 1))),
    }))
    .filter((prize) => prize.rank && prize.name);

  return valid.length > 0 ? valid : copyDefaults();
}

export function defaultIchibanPrizes() {
  return copyDefaults();
}

export function prizeTotal(prizes: IchibanPrize[]) {
  return prizes.reduce((total, prize) => total + prize.quantity, 0);
}

/** 把剩下的每一張籤攤開成獎項索引並洗牌；輪播上的每張票對應其中一格。 */
export function buildTicketPool(prizes: IchibanPrize[], drawn: number[] = [], random = Math.random): number[] {
  const pool = prizes.flatMap((prize, index) =>
    Array.from({ length: Math.max(0, prize.quantity - (drawn[index] ?? 0)) }, () => index),
  );
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool;
}
