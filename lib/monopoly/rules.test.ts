import { describe, expect, it } from "vitest";
import { resolveLanding, startGame, takeTurn } from "./rules";
import { seqRng } from "./rng";
import {
  DEFAULT_SETTINGS,
  type Player,
  type PlayerInput,
  type Question,
} from "./types";

// 測試輔助：不可變更新玩家
function replaceForTest(
  players: Player[],
  i: number,
  patch: Partial<Player>,
): Player[] {
  return players.map((p, idx) => (idx === i ? { ...p, ...patch } : p));
}

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
      name: "小明",
      money: 15000,
      position: 0,
      bankrupt: false,
      skipTurns: 0,
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

function game() {
  return startGame(DEFAULT_SETTINGS, Q, PLAYERS, 0);
}

describe("takeTurn 擲骰與移動", () => {
  it("擲骰移動並記錄 lastRoll（兩顆骰 0.99,0.99 → 6+6=12）", () => {
    const s = takeTurn(game(), seqRng([0.99, 0.99]));
    expect(s.lastRoll).toEqual([6, 6]);
    expect(s.players[0].position).toBe(12); // 0 -> 12
  });

  it("繞過起點發薪並 lap+1（從 23 擲 5 → 繞回 4）", () => {
    let s = game();
    s = { ...s, players: replaceForTest(s.players, 0, { position: 23 }) };
    s = takeTurn(s, seqRng([0.5, 0])); // 4 + 1 = 5; 23+5=28 %24 =4，經過起點
    expect(s.players[0].position).toBe(4);
    expect(s.players[0].money).toBe(
      DEFAULT_SETTINGS.startingMoney + DEFAULT_SETTINGS.passStartBonus,
    );
    expect(s.lapsByPlayer["p0"]).toBe(1);
  });

  it("skipTurns>0 時跳過該玩家、不擲骰、換下一位", () => {
    let s = game();
    s = { ...s, players: replaceForTest(s.players, 0, { skipTurns: 1 }) };
    const after = takeTurn(s, seqRng([0.99, 0.99]));
    expect(after.players[0].skipTurns).toBe(0);
    expect(after.lastRoll).toBeNull();
    expect(after.currentPlayerIndex).toBe(1);
  });
});

describe("resolveLanding 各格", () => {
  it("無主地 → buyQuestion", () => {
    let s = game();
    s = { ...s, players: replaceForTest(s.players, 0, { position: 1 }) };
    s = resolveLanding(s, seqRng([0]));
    expect(s.pendingAction?.kind).toBe("buyQuestion");
  });

  it("自己的地 → buildQuestion", () => {
    let s = game();
    s = { ...s, players: replaceForTest(s.players, 0, { position: 1, ownedTiles: [1] }) };
    s = resolveLanding(s, seqRng([0]));
    expect(s.pendingAction?.kind).toBe("buildQuestion");
  });

  it("機會格 → drawCard(chance)", () => {
    let s = game();
    s = { ...s, players: replaceForTest(s.players, 0, { position: 2 }) };
    s = resolveLanding(s, seqRng([0]));
    expect(s.pendingAction).toMatchObject({ kind: "drawCard", deck: "chance" });
  });

  it("監獄格 → skipTurns=1 並結束回合（pendingAction 為 null）", () => {
    let s = game();
    s = { ...s, players: replaceForTest(s.players, 0, { position: 7 }) };
    s = resolveLanding(s, seqRng([0]));
    expect(s.players[0].skipTurns).toBe(1);
    expect(s.pendingAction).toBeNull();
  });
});
