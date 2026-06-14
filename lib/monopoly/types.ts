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
  toll: number[]; // [空地, 1棟, 2棟, 3棟...]
  houseCost: number;
  maxHouses: number;
}

export type Tile = BaseTile | PropertyTile;

export function isProperty(tile: Tile): tile is PropertyTile {
  return tile.type === "property";
}

// === 機會/命運卡 ===
export type CardEffect =
  | { kind: "money"; amount: number }
  | { kind: "move"; steps: number }
  | { kind: "moveTo"; tileIndex: number }
  | { kind: "jail" }
  | { kind: "skip" };

export interface Card {
  id: string;
  deck: "chance" | "fate";
  text: string;
  effect: CardEffect;
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
  bankrupt: boolean;
}

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
  | { seq: number; kind: "skip"; playerId: string }; // 監獄／暫停一回合

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
