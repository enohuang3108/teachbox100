import { BOARD, BOARD_SIZE } from "./board";
import type {
  GameSettings,
  GameState,
  Player,
  PlayerInput,
  Question,
} from "./types";

// === 不可變工具 ===
function replacePlayer(players: Player[], index: number, patch: Partial<Player>): Player[] {
  return players.map((p, i) => (i === index ? { ...p, ...patch } : p));
}

function addLog(log: string[], message: string): string[] {
  return [message, ...log].slice(0, 100);
}

// === 開始遊戲 ===
export function startGame(
  settings: GameSettings,
  questions: Question[],
  inputs: PlayerInput[],
  now: number,
): GameState {
  const players: Player[] = inputs.map((input, i) => ({
    id: `p${i}`,
    name: input.name,
    color: input.color,
    money: settings.startingMoney,
    position: 0,
    ownedTiles: [],
    houses: {},
    skipTurns: 0,
    bankrupt: false,
  }));
  const lapsByPlayer: Record<string, number> = {};
  players.forEach((p) => (lapsByPlayer[p.id] = 0));

  return {
    phase: "playing",
    settings,
    questions,
    players,
    currentPlayerIndex: 0,
    lastRoll: null,
    pendingAction: null,
    startedAt: now,
    lapsByPlayer,
    log: [`遊戲開始，共 ${players.length} 位玩家`],
  };
}

// 後續 Task 使用的內部工具（暫時匯出以避免未使用警告，於 Task 7 起改為模組內共用）
export const _internal = { replacePlayer, addLog, BOARD, BOARD_SIZE };
