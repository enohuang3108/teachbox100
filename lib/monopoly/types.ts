// === 題目 ===
export type QuestionType = "choice" | "boolean" | "short";

export interface Question {
  id: string;
  type: QuestionType;
  text: string;
  options?: string[];
  answer: string; // choice: 選項文字; boolean: "是"/"否"; short: 參考答案
  explanation?: string;
}

// === 棋盤 ===
export type TileType = "start" | "property" | "chance" | "fate" | "jail";

export interface BaseTile {
  index: number;
  type: TileType;
  name: string;
  image?: string; // 圖示路徑（地標／機會／命運），可選
}

export interface PropertyTile extends BaseTile {
  type: "property";
  price: number;
  toll: number[]; // [空地, 1棟, 2棟, 旅館]，索引 = 建設等級
  houseCost: number; // 蓋 1 棟房子的單價
  hotelCost: number; // 蓋滿房子後升級旅館的費用
  maxHouses: number; // 最多幾棟房子（蓋滿後才能升旅館）
}

export type Tile = BaseTile | PropertyTile;

export function isProperty(tile: Tile): tile is PropertyTile {
  return tile.type === "property";
}

// 建設等級：0=空地、1..maxHouses=房子、maxHouses+1=旅館。
export function maxBuildLevel(tile: PropertyTile): number {
  return tile.maxHouses + 1; // 最高一級為旅館
}

export function isHotelLevel(tile: PropertyTile, level: number): boolean {
  return level > tile.maxHouses;
}

// 由 currentLevel 蓋到 currentLevel+1 的花費（升旅館用 hotelCost，否則 houseCost）。
export function buildCostFor(tile: PropertyTile, currentLevel: number): number {
  return currentLevel + 1 > tile.maxHouses ? tile.hotelCost : tile.houseCost;
}

// === 機會/命運卡 ===
export type CardEffect =
  | { kind: "money"; amount: number }
  | { kind: "move"; steps: number }
  | { kind: "moveTo"; tileIndex: number }
  | { kind: "jail" }
  | { kind: "skip" }
  // === 互動式效果（需要玩家操作）===
  // 擲一顆骰，點數 × perPip 入袋（perPip 為負則為罰款，金額隨點數放大）
  | { kind: "diceReward"; perPip: number }
  // 擲一顆骰，點數即前進步數（會再結算落點）
  | { kind: "diceMove" }
  // 擲一顆骰賭單雙：單數 +amount、雙數 −amount
  | { kind: "diceBet"; amount: number }
  // 從題庫抽題作答：答對 +reward；答錯依 onWrong 罰款或進監獄
  | {
      kind: "quiz";
      reward: number;
      onWrong: { kind: "money"; amount: number } | { kind: "jail" };
    };

export interface Card {
  id: string;
  deck: "chance" | "fate";
  text: string;
  effect: CardEffect;
}

// 互動式卡片：抽到後不立即套用，先讓玩家操作（擲骰／答題）再結算
export function isInteractiveCard(card: Card): boolean {
  return (
    card.effect.kind === "diceReward" ||
    card.effect.kind === "diceMove" ||
    card.effect.kind === "diceBet" ||
    card.effect.kind === "quiz"
  );
}

// === 玩家 ===
export interface Player {
  id: string;
  name: string;
  color: string;
  character: string; // 角色 slug，對應 lib/monopoly/characters.ts
  money: number;
  position: number;
  ownedTiles: number[];
  houses: Record<number, number>;
  skipTurns: number;
  skipReason?: SkipReason; // 暫停原因：監獄 or 休息（生病）
  bankrupt: boolean;
}

// 暫停一回合的原因：影響過場動畫呈現（監獄 🚔 ／ 休息 😴）
export type SkipReason = "jail" | "rest";

export interface PlayerInput {
  name: string;
  color: string;
  character: string; // 角色 slug，對應 lib/monopoly/characters.ts
}

// === 設定 ===
export type EndCondition =
  | { type: "time"; minutes: number }
  | { type: "moneyGoal"; amount: number }
  | { type: "lastOneStanding" }
  | { type: "laps"; count: number };

export interface GameSettings {
  playerCount: number;
  startingMoney: number;
  diceCount: 1 | 2;
  passStartBonus: number;
  endCondition: EndCondition;
}

export const DEFAULT_SETTINGS: GameSettings = {
  playerCount: 4,
  startingMoney: 8000,
  diceCount: 2,
  passStartBonus: 2000,
  endCondition: { type: "time", minutes: 40 },
};

// 玩家代表色。此陣列的「順序」即是設定頁顏色選擇器的顯示順序，
// 要調整排列直接改這裡即可（目前依色系排：紅→橙→黃→綠→青→藍→紫→粉→灰）。
export const PLAYER_COLORS: string[] = [
  "#f43f5e", // rose 玫瑰
  "#ef4444", // red 紅
  "#f97316", // orange 橙
  "#f59e0b", // amber 琥珀
  "#eab308", // yellow 黃
  "#84cc16", // lime 萊姆
  "#22c55e", // green 綠
  "#10b981", // emerald 翡翠
  "#14b8a6", // teal 藍綠
  "#06b6d4", // cyan 青
  "#0ea5e9", // sky 天藍
  "#3b82f6", // blue 藍
  "#6366f1", // indigo 靛
  "#7c3aed", // violet-700 深紫
  "#8b5cf6", // violet 紫羅蘭
  "#a855f7", // purple 紫
  "#d946ef", // fuchsia 洋紅
  "#ec4899", // pink 粉
  "#db2777", // pink-600 深粉
  "#64748b", // slate 灰藍（中性）
];

// === 進行中事件 ===
export type PendingAction =
  | { kind: "buyQuestion"; tileIndex: number; question: Question }
  | { kind: "buildQuestion"; tileIndex: number; question: Question }
  | { kind: "confirmBuy"; tileIndex: number }
  | { kind: "confirmBuild"; tileIndex: number }
  | { kind: "drawCard"; deck: "chance" | "fate"; card: Card }
  // 互動擲骰卡：rolled 為 null 表示尚未擲，擲出後存點數待結算
  | { kind: "cardDice"; card: Card; rolled: number | null }
  // 互動答題卡：從題庫抽出的題目，待玩家作答
  | { kind: "cardQuiz"; card: Card; question: Question }
  // 過起點加碼題：答對 +rewardRight、答錯 +rewardWrong（原本獎勵）
  | {
      kind: "passStartQuestion";
      question: Question;
      rewardRight: number;
      rewardWrong: number;
    }
  | null;

// === 過場事件（供 UI 播放聚光燈過場；seq 遞增讓 UI 偵測「新事件」）===
export type CutsceneEvent =
  | {
      seq: number;
      kind: "toll";
      payerId: string;
      ownerId: string;
      amount: number;
      tileName: string;
    }
  | { seq: number; kind: "passStart"; playerId: string; amount: number }
  | {
      seq: number;
      kind: "card";
      playerId: string;
      amount: number;
      deck: "chance" | "fate";
      text: string;
    }
  | {
      seq: number;
      kind: "buy";
      playerId: string;
      amount: number;
      tileName: string;
    }
  | {
      seq: number;
      kind: "build";
      playerId: string;
      amount: number;
      tileName: string;
    }
  | { seq: number; kind: "skip"; playerId: string; reason: SkipReason }; // 監獄／休息：暫停一回合

// === 整體狀態 ===
export type GamePhase = "setup" | "playing" | "gameover";

export interface GameState {
  phase: GamePhase;
  settings: GameSettings;
  questions: Question[];
  players: Player[];
  currentPlayerIndex: number;
  lastRoll: number[] | null;
  pendingAction: PendingAction;
  startedAt: number | null;
  lapsByPlayer: Record<string, number>;
  log: string[];
  cutsceneEvents?: CutsceneEvent[]; // 近期過場事件佇列（依序播放；seq 遞增供 UI 去重）
}
