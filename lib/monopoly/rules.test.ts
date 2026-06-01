import { describe, expect, it } from "vitest";
import { startGame } from "./rules";
import { DEFAULT_SETTINGS, type PlayerInput, type Question } from "./types";

const Q: Question[] = [
  { id: "q1", type: "boolean", text: "台北是台灣首都", answer: "是" },
];
const PLAYERS: PlayerInput[] = [
  { name: "小明", color: "#ef4444" },
  { name: "小華", color: "#3b82f6" },
];

describe("startGame", () => {
  it("建立 playing 狀態，玩家在起點、持有起始金", () => {
    const s = startGame(DEFAULT_SETTINGS, Q, PLAYERS, 1000);
    expect(s.phase).toBe("playing");
    expect(s.players).toHaveLength(2);
    expect(s.players[0]).toMatchObject({
      name: "小明", money: 15000, position: 0, bankrupt: false, skipTurns: 0,
    });
    expect(s.currentPlayerIndex).toBe(0);
    expect(s.startedAt).toBe(1000);
    expect(s.questions).toEqual(Q);
  });

  it("每位玩家 id 唯一且 lapsByPlayer 初始為 0", () => {
    const s = startGame(DEFAULT_SETTINGS, Q, PLAYERS, 0);
    const ids = s.players.map((p) => p.id);
    expect(new Set(ids).size).toBe(2);
    ids.forEach((id) => expect(s.lapsByPlayer[id]).toBe(0));
  });
});
