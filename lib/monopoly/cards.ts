import type { Card } from "./types";

export const CHANCE_CARDS: Card[] = [
  { id: "c1", deck: "chance", text: "中了發票頭獎，獲得 $2000", effect: { kind: "money", amount: 2000 } },
  { id: "c2", deck: "chance", text: "幸運抽中禮券，獲得 $1000", effect: { kind: "money", amount: 1000 } },
  { id: "c3", deck: "chance", text: "好運連連，前進 3 格", effect: { kind: "move", steps: 3 } },
  { id: "c4", deck: "chance", text: "搭高鐵直達台北", effect: { kind: "moveTo", tileIndex: 1 } },
  { id: "c5", deck: "chance", text: "回到起點重新出發", effect: { kind: "moveTo", tileIndex: 0 } },
  { id: "c6", deck: "chance", text: "再接再厲，前進 1 格", effect: { kind: "move", steps: 1 } },
];

export const FATE_CARDS: Card[] = [
  { id: "f1", deck: "fate", text: "違規停車被開單，罰款 $1000", effect: { kind: "money", amount: -1000 } },
  { id: "f2", deck: "fate", text: "繳交所得稅，罰款 $1500", effect: { kind: "money", amount: -1500 } },
  { id: "f3", deck: "fate", text: "走錯路，後退 2 格", effect: { kind: "move", steps: -2 } },
  { id: "f4", deck: "fate", text: "違規被抓，直接進監獄", effect: { kind: "jail" } },
  { id: "f5", deck: "fate", text: "生病休息，暫停一回合", effect: { kind: "skip" } },
  { id: "f6", deck: "fate", text: "迷路了，後退 1 格", effect: { kind: "move", steps: -1 } },
];

export function deckOf(deck: "chance" | "fate"): Card[] {
  return deck === "chance" ? CHANCE_CARDS : FATE_CARDS;
}
