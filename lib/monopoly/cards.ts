import type { Card } from "./types";

// 機會（chance）＝正向／機會性質：獎金、前進、擲骰得利、答對拿獎金（答錯不罰）。
export const CHANCE_CARDS: Card[] = [
  {
    id: "c1",
    deck: "chance",
    text: "中了發票頭獎，獲得 $2000",
    effect: { kind: "money", amount: 2000 },
  },
  {
    id: "c2",
    deck: "chance",
    text: "幸運抽中禮券，獲得 $1000",
    effect: { kind: "money", amount: 1000 },
  },
  {
    id: "c3",
    deck: "chance",
    text: "好運連連，前進 3 格",
    effect: { kind: "move", steps: 3 },
  },
  {
    id: "c4",
    deck: "chance",
    text: "搭高鐵直達台北",
    effect: { kind: "moveTo", tileIndex: 32 },
  },
  {
    id: "c5",
    deck: "chance",
    text: "中大獎！擲骰子，點數 ×$500 入袋",
    effect: { kind: "diceReward", perPip: 500 },
  },
  {
    id: "c6",
    deck: "chance",
    text: "搭上順風車！擲骰子，前進對應步數",
    effect: { kind: "diceMove" },
  },
  {
    id: "c7",
    deck: "chance",
    text: "益智搶答：答對獨得 $2000（答錯不罰）",
    effect: {
      kind: "quiz",
      reward: 2000,
      onWrong: { kind: "money", amount: 0 },
    },
  },
  {
    id: "c8",
    deck: "chance",
    text: "幸運賭局：擲骰子，單數 +$2000、雙數 −$2000",
    effect: { kind: "diceBet", amount: 2000 },
  },
  {
    id: "c9",
    deck: "chance",
    text: "再接再厲，前進 1 格",
    effect: { kind: "move", steps: 1 },
  },
  {
    id: "c10",
    deck: "chance",
    text: "回到起點重新出發",
    effect: { kind: "moveTo", tileIndex: 0 },
  },
];

// 命運（fate）＝負向／懲罰性質：罰款、後退、進監獄、答錯受罰（答對只是免於受罰）。
export const FATE_CARDS: Card[] = [
  {
    id: "f1",
    deck: "fate",
    text: "違規停車被開單，罰款 $1000",
    effect: { kind: "money", amount: -1000 },
  },
  {
    id: "f2",
    deck: "fate",
    text: "繳交所得稅，罰款 $1500",
    effect: { kind: "money", amount: -1500 },
  },
  {
    id: "f3",
    deck: "fate",
    text: "走錯路，後退 2 格",
    effect: { kind: "move", steps: -2 },
  },
  {
    id: "f4",
    deck: "fate",
    text: "違規被抓，直接進監獄",
    effect: { kind: "jail" },
  },
  {
    id: "f5",
    deck: "fate",
    text: "生病休息，暫停一回合",
    effect: { kind: "skip" },
  },
  {
    id: "f6",
    deck: "fate",
    text: "突擊測驗：答錯罰 $1000（答對沒事）",
    effect: {
      kind: "quiz",
      reward: 0,
      onWrong: { kind: "money", amount: 1000 },
    },
  },
  {
    id: "f7",
    deck: "fate",
    text: "作弊被抓包：答錯直接進監獄（答對沒事）",
    effect: { kind: "quiz", reward: 0, onWrong: { kind: "jail" } },
  },
  {
    id: "f8",
    deck: "fate",
    text: "厄運降臨！擲骰子，點數 ×$300 罰款",
    effect: { kind: "diceReward", perPip: -300 },
  },
  {
    id: "f9",
    deck: "fate",
    text: "迷路了，後退 1 格",
    effect: { kind: "move", steps: -1 },
  },
  {
    id: "f10",
    deck: "fate",
    text: "補繳水電費，罰款 $800",
    effect: { kind: "money", amount: -800 },
  },
];

export function deckOf(deck: "chance" | "fate"): Card[] {
  return deck === "chance" ? CHANCE_CARDS : FATE_CARDS;
}
