import { describe, expect, it } from "vitest";
import {
  answerQuestion,
  confirmPurchase,
  drawAndApplyCard,
  resolveLanding,
  startGame,
  takeTurn,
} from "./rules";
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
    s = {
      ...s,
      players: replaceForTest(s.players, 0, { position: 1, ownedTiles: [1] }),
    };
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

function landedOnUnowned() {
  let s = game();
  s = { ...s, players: replaceForTest(s.players, 0, { position: 1 }) };
  return resolveLanding(s, seqRng([0])); // pendingAction = buyQuestion(tile 1)
}

describe("answerQuestion / confirmPurchase 買地", () => {
  it("答對 → confirmBuy", () => {
    const s = answerQuestion(landedOnUnowned(), true);
    expect(s.pendingAction).toMatchObject({ kind: "confirmBuy", tileIndex: 1 });
  });

  it("答錯 → 不能買、結束回合、換人", () => {
    const s = answerQuestion(landedOnUnowned(), false);
    expect(s.pendingAction).toBeNull();
    expect(s.players[0].ownedTiles).toEqual([]);
    expect(s.currentPlayerIndex).toBe(1);
  });

  it("confirm 買 → 扣地價、取得地、換人", () => {
    let s = answerQuestion(landedOnUnowned(), true);
    s = confirmPurchase(s, true);
    expect(s.players[0].ownedTiles).toEqual([1]);
    expect(s.players[0].money).toBe(15000 - 2000);
    expect(s.currentPlayerIndex).toBe(1);
  });

  it("confirm 不買 → 不扣錢、不取得", () => {
    let s = answerQuestion(landedOnUnowned(), true);
    s = confirmPurchase(s, false);
    expect(s.players[0].ownedTiles).toEqual([]);
    expect(s.players[0].money).toBe(15000);
  });

  it("錢不足無法買", () => {
    let s = landedOnUnowned();
    s = { ...s, players: replaceForTest(s.players, 0, { money: 100 }) };
    s = answerQuestion(s, true);
    s = confirmPurchase(s, true);
    expect(s.players[0].ownedTiles).toEqual([]);
    expect(s.players[0].money).toBe(100);
  });
});

describe("蓋房", () => {
  function ownAndLand() {
    let s = game();
    s = {
      ...s,
      players: replaceForTest(s.players, 0, { position: 1, ownedTiles: [1] }),
    };
    return resolveLanding(s, seqRng([0])); // buildQuestion
  }
  it("答對並確認 → houses+1、扣 houseCost", () => {
    let s = answerQuestion(ownAndLand(), true);
    expect(s.pendingAction).toMatchObject({
      kind: "confirmBuild",
      tileIndex: 1,
    });
    s = confirmPurchase(s, true);
    expect(s.players[0].houses[1]).toBe(1);
    expect(s.players[0].money).toBe(15000 - 1000); // houseCost = price/2 = 1000
  });
});

describe("破產", () => {
  it("付不出過路費 → 破產、釋地、後續被跳過", () => {
    let s = game();
    // p1 擁有 tile 1 並蓋滿房子（高額過路費）
    s = {
      ...s,
      players: replaceForTest(s.players, 1, {
        ownedTiles: [1],
        houses: { 1: 3 },
      }),
    };
    // p0 錢只剩 100，停在 tile 1
    s = {
      ...s,
      players: replaceForTest(s.players, 0, { position: 1, money: 100 }),
    };
    s = resolveLanding(s, seqRng([0])); // 觸發 payToll
    expect(s.players[0].bankrupt).toBe(true);
    expect(s.players[0].money).toBe(0);
    expect(s.players[0].ownedTiles).toEqual([]);
    // 地主收到 p0 能付的 100
    expect(s.players[1].money).toBe(15000 + 100);
  });
});

function landOnCard(_deck: "chance" | "fate", pos: number) {
  let s = game();
  s = { ...s, players: replaceForTest(s.players, 0, { position: pos }) };
  return s;
}

describe("drawAndApplyCard", () => {
  it("money 卡 → 加錢並結束回合", () => {
    // 機會格 index 2，seqRng 第一個值挑卡：挑到 c1(+2000)
    let s = landOnCard("chance", 2);
    s = resolveLanding(s, seqRng([0])); // pendingAction drawCard chance, card index 0 = c1 +2000
    s = drawAndApplyCard(s, seqRng([0]));
    expect(s.players[0].money).toBe(15000 + 2000);
    expect(s.currentPlayerIndex).toBe(1);
  });

  it("moveTo 起點(0) → 移動後落點結算（起點無事、結束回合）", () => {
    let s = landOnCard("chance", 2);
    // 強制抽到 c5 (moveTo 0)：CHANCE_CARDS index 4 → rng 0.7*6=4
    s = resolveLanding(s, seqRng([4 / 6 + 0.001]));
    s = drawAndApplyCard(s, seqRng([0]));
    expect(s.players[0].position).toBe(0);
  });

  it("jail 卡 → skipTurns=1", () => {
    let s = landOnCard("fate", 5);
    // FATE_CARDS index 3 = f4 jail → rng 3/6+eps
    s = resolveLanding(s, seqRng([3 / 6 + 0.001]));
    s = drawAndApplyCard(s, seqRng([0]));
    expect(s.players[0].skipTurns).toBe(1);
  });

  it("連鎖達上限會強制結束（不會無限迴圈）", () => {
    let s = landOnCard("chance", 2);
    s = resolveLanding(s, seqRng([0]));
    s = drawAndApplyCard(s, seqRng([0.99]));
    expect(s.pendingAction === null || s.pendingAction.kind !== "drawCard").toBe(true);
  });
});
