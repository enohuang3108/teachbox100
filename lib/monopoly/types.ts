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
  startingMoney: 15000,
  diceCount: 2,
  passStartBonus: 2000,
  endCondition: { type: "time", minutes: 40 },
};

export const PLAYER_COLORS: string[] = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#14b8a6",
  "#3b82f6",
  "#6366f1",
  "#a855f7",
  "#ec4899",
  "#f43f5e",
  "#84cc16",
  "#06b6d4",
  "#0ea5e9",
  "#8b5cf6",
  "#d946ef",
  "#10b981",
  "#f59e0b",
  "#64748b",
  "#7c3aed",
  "#db2777",
];

// === 進行中事件 ===
export type PendingAction =
  | { kind: "buyQuestion"; tileIndex: number; question: Question }
  | { kind: "buildQuestion"; tileIndex: number; question: Question }
  | { kind: "confirmBuy"; tileIndex: number }
  | { kind: "confirmBuild"; tileIndex: number }
  | { kind: "drawCard"; deck: "chance" | "fate"; card: Card }
  | null;

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
}
