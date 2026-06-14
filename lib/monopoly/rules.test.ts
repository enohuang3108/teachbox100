import { describe, expect, it } from "vitest";
import {
  answerCardQuiz,
  answerQuestion,
  confirmPurchase,
  drawAndApplyCard,
  ranking,
  resolveCardDice,
  resolveLanding,
  rollCardDice,
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
  { name: "小明", color: "#ef4444", character: "capybara" },
  { name: "小華", color: "#3b82f6", character: "quokka" },
];

describe("startGame", () => {
  it("建立 playing 狀態，玩家在起點、持有起始金", () => {
    const s = startGame(DEFAULT_SETTINGS, Q, PLAYERS, 1000);
    expect(s.phase).toBe("playing");
    expect(s.players).toHaveLength(2);
    expect(s.players[0]).toMatchObject({
      name: "小明",
      money: 8000,
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
    const s = takeTurn(game(), seqRng([0.99, 0.99]), 0);
    expect(s.lastRoll).toEqual([6, 6]);
    expect(s.players[0].position).toBe(12); // 0 -> 12
  });

  it("繞過起點發薪並 lap+1（從 33 擲 5 → 繞回 4）", () => {
    let s = game();
    s = { ...s, players: replaceForTest(s.players, 0, { position: 33 }) };
    s = takeTurn(s, seqRng([0.5, 0]), 0); // 4 + 1 = 5; 33+5=38 %34 =4，經過起點
    expect(s.players[0].position).toBe(4);
    expect(s.players[0].money).toBe(
      DEFAULT_SETTINGS.startingMoney + DEFAULT_SETTINGS.passStartBonus,
    );
    expect(s.lapsByPlayer["p0"]).toBe(1);
  });

  it("skipTurns>0 時跳過該玩家、不擲骰、換下一位", () => {
    let s = game();
    s = { ...s, players: replaceForTest(s.players, 0, { skipTurns: 1 }) };
    const after = takeTurn(s, seqRng([0.99, 0.99]), 0);
    expect(after.players[0].skipTurns).toBe(0);
    expect(after.lastRoll).toBeNull();
    expect(after.currentPlayerIndex).toBe(1);
  });
});

describe("resolveLanding 各格", () => {
  it("無主地 → buyQuestion", () => {
    let s = game();
    s = { ...s, players: replaceForTest(s.players, 0, { position: 1 }) };
    s = resolveLanding(s, seqRng([0]), 0);
    expect(s.pendingAction?.kind).toBe("buyQuestion");
  });

  it("自己的地 → buildQuestion", () => {
    let s = game();
    s = {
      ...s,
      players: replaceForTest(s.players, 0, { position: 1, ownedTiles: [1] }),
    };
    s = resolveLanding(s, seqRng([0]), 0);
    expect(s.pendingAction?.kind).toBe("buildQuestion");
  });

  it("機會格 → drawCard(chance)", () => {
    let s = game();
    s = { ...s, players: replaceForTest(s.players, 0, { position: 3 }) };
    s = resolveLanding(s, seqRng([0]), 0);
    expect(s.pendingAction).toMatchObject({ kind: "drawCard", deck: "chance" });
  });

  it("監獄格 → skipTurns=1 並結束回合（pendingAction 為 null）", () => {
    let s = game();
    s = { ...s, players: replaceForTest(s.players, 0, { position: 11 }) };
    s = resolveLanding(s, seqRng([0]), 0);
    expect(s.players[0].skipTurns).toBe(1);
    expect(s.pendingAction).toBeNull();
  });
});

function landedOnUnowned() {
  let s = game();
  // tile 32 = 台北101（售價 4000），方便驗證金額
  s = { ...s, players: replaceForTest(s.players, 0, { position: 32 }) };
  return resolveLanding(s, seqRng([0]), 0); // pendingAction = buyQuestion(tile 32)
}

describe("answerQuestion / confirmPurchase 買地", () => {
  it("答對 → confirmBuy", () => {
    const s = answerQuestion(landedOnUnowned(), true, 0);
    expect(s.pendingAction).toMatchObject({
      kind: "confirmBuy",
      tileIndex: 32,
    });
  });

  it("答錯 → 不能買、結束回合、換人", () => {
    const s = answerQuestion(landedOnUnowned(), false, 0);
    expect(s.pendingAction).toBeNull();
    expect(s.players[0].ownedTiles).toEqual([]);
    expect(s.currentPlayerIndex).toBe(1);
  });

  it("confirm 買 → 扣地價、取得地、換人", () => {
    let s = answerQuestion(landedOnUnowned(), true, 0);
    s = confirmPurchase(s, true, 0);
    expect(s.players[0].ownedTiles).toEqual([32]);
    expect(s.players[0].money).toBe(8000 - 4000); // 台北101 售價 4000
    expect(s.currentPlayerIndex).toBe(1);
  });

  it("confirm 不買 → 不扣錢、不取得", () => {
    let s = answerQuestion(landedOnUnowned(), true, 0);
    s = confirmPurchase(s, false, 0);
    expect(s.players[0].ownedTiles).toEqual([]);
    expect(s.players[0].money).toBe(8000);
  });

  it("錢不足無法買", () => {
    let s = landedOnUnowned();
    s = { ...s, players: replaceForTest(s.players, 0, { money: 100 }) };
    s = answerQuestion(s, true, 0);
    s = confirmPurchase(s, true, 0);
    expect(s.players[0].ownedTiles).toEqual([]);
    expect(s.players[0].money).toBe(100);
  });
});

describe("蓋房", () => {
  function ownAndLand() {
    let s = game();
    // tile 32 = 台北101（蛋黃地，houseCost 1400 / hotelCost 2200）
    s = {
      ...s,
      players: replaceForTest(s.players, 0, { position: 32, ownedTiles: [32] }),
    };
    return resolveLanding(s, seqRng([0]), 0); // buildQuestion
  }
  it("答對並確認 → houses+1、扣 houseCost", () => {
    let s = answerQuestion(ownAndLand(), true, 0);
    expect(s.pendingAction).toMatchObject({
      kind: "confirmBuild",
      tileIndex: 32,
    });
    s = confirmPurchase(s, true, 0);
    expect(s.players[0].houses[32]).toBe(1);
    expect(s.players[0].money).toBe(8000 - 1400); // 台北101(蛋黃地) houseCost = 4000×0.35
  });

  it("蓋滿房子後再蓋 → 升級旅館（等級 3）、扣 hotelCost", () => {
    let s = game();
    // 已蓋滿 2 棟房子，停在自己的地 → buildQuestion（這次蓋的是旅館）
    s = {
      ...s,
      players: replaceForTest(s.players, 0, {
        position: 32,
        ownedTiles: [32],
        houses: { 32: 2 },
      }),
    };
    s = resolveLanding(s, seqRng([0]), 0);
    expect(s.pendingAction?.kind).toBe("buildQuestion");
    s = answerQuestion(s, true, 0);
    s = confirmPurchase(s, true, 0);
    expect(s.players[0].houses[32]).toBe(3); // 等級 3 = 旅館
    expect(s.players[0].money).toBe(8000 - 2200); // 台北101 hotelCost = 4000×0.55
  });
});

describe("破產", () => {
  it("付不出過路費 → 破產、釋地、後續被跳過", () => {
    let s = game();
    // p1 擁有 tile 32（台北101）並蓋旅館（高額過路費）
    s = {
      ...s,
      players: replaceForTest(s.players, 1, {
        ownedTiles: [32],
        houses: { 32: 3 },
      }),
    };
    // p0 錢只剩 100，停在 tile 32
    s = {
      ...s,
      players: replaceForTest(s.players, 0, { position: 32, money: 100 }),
    };
    s = resolveLanding(s, seqRng([0]), 0); // 觸發 payToll
    expect(s.players[0].bankrupt).toBe(true);
    expect(s.players[0].money).toBe(0);
    expect(s.players[0].ownedTiles).toEqual([]);
    // 地主收到 p0 能付的 100
    expect(s.players[1].money).toBe(8000 + 100);
  });
});

function landOnCard(_deck: "chance" | "fate", pos: number) {
  let s = game();
  s = { ...s, players: replaceForTest(s.players, 0, { position: pos }) };
  return s;
}

describe("drawAndApplyCard", () => {
  it("money 卡 → 加錢並結束回合", () => {
    // 機會格 index 3，seqRng 第一個值挑卡：挑到 c1(+2000)
    let s = landOnCard("chance", 3);
    s = resolveLanding(s, seqRng([0]), 0); // pendingAction drawCard chance, card index 0 = c1 +2000
    s = drawAndApplyCard(s, seqRng([0]), 0);
    expect(s.players[0].money).toBe(8000 + 2000);
    expect(s.currentPlayerIndex).toBe(1);
  });

  it("moveTo 起點(0) → 移動後落點結算（起點無事、結束回合）", () => {
    let s = landOnCard("chance", 3);
    // 強制抽到 c10 (moveTo 0)：CHANCE_CARDS index 9（共 10 張）→ rng 9/10+eps
    s = resolveLanding(s, seqRng([9 / 10 + 0.001]), 0);
    s = drawAndApplyCard(s, seqRng([0]), 0);
    expect(s.players[0].position).toBe(0);
  });

  it("jail 卡 → skipTurns=1", () => {
    let s = landOnCard("fate", 6);
    // FATE_CARDS index 3 = f4 jail（共 10 張）→ rng 3/10+eps
    s = resolveLanding(s, seqRng([3 / 10 + 0.001]), 0);
    s = drawAndApplyCard(s, seqRng([0]), 0);
    expect(s.players[0].skipTurns).toBe(1);
  });

  it("連鎖達上限會強制結束（不會無限迴圈）", () => {
    let s = landOnCard("chance", 2);
    s = resolveLanding(s, seqRng([0]), 0);
    s = drawAndApplyCard(s, seqRng([0.99]), 0);
    expect(
      s.pendingAction === null || s.pendingAction.kind !== "drawCard",
    ).toBe(true);
  });
});

describe("互動式卡片", () => {
  // 抽到第 index 張互動卡（共 10 張）後停在等待玩家操作的 pendingAction
  function drawInteractive(
    deck: "chance" | "fate",
    pos: number,
    index: number,
  ) {
    let s = landOnCard(deck, pos);
    s = resolveLanding(s, seqRng([index / 10 + 0.001]), 0);
    return drawAndApplyCard(s, seqRng([0]), 0);
  }

  it("擲骰卡抽到後進入 cardDice、擲骰只記點數不套用", () => {
    const s = drawInteractive("chance", 3, 4); // c5 diceReward perPip 500
    expect(s.pendingAction?.kind).toBe("cardDice");
    const rolled = rollCardDice(s, seqRng([5 / 6 + 0.001])); // 擲出 6
    expect(rolled.pendingAction).toMatchObject({ kind: "cardDice", rolled: 6 });
    expect(rolled.players[0].money).toBe(8000); // 尚未套用
  });

  it("diceReward：點數 × perPip 入袋並結束回合", () => {
    let s = drawInteractive("chance", 3, 4); // c5 perPip 500
    s = rollCardDice(s, seqRng([5 / 6 + 0.001])); // 6
    s = resolveCardDice(s, seqRng([0]), 0);
    expect(s.players[0].money).toBe(8000 + 6 * 500);
    expect(s.currentPlayerIndex).toBe(1);
  });

  it("diceReward 負 perPip：依點數罰款", () => {
    let s = drawInteractive("fate", 6, 7); // f8 perPip -300
    s = rollCardDice(s, seqRng([3 / 6 + 0.001])); // 4
    s = resolveCardDice(s, seqRng([0]), 0);
    expect(s.players[0].money).toBe(8000 - 4 * 300);
  });

  it("diceBet：雙數賠錢、單數贏錢", () => {
    let lose = drawInteractive("chance", 3, 7); // c8 amount 2000
    lose = rollCardDice(lose, seqRng([1 / 6 + 0.001])); // 2（雙數）
    lose = resolveCardDice(lose, seqRng([0]), 0);
    expect(lose.players[0].money).toBe(8000 - 2000);

    let win = drawInteractive("chance", 3, 7);
    win = rollCardDice(win, seqRng([0])); // 1（單數）
    win = resolveCardDice(win, seqRng([0]), 0);
    expect(win.players[0].money).toBe(8000 + 2000);
  });

  it("diceMove：點數即前進步數，經過起點加獎勵", () => {
    let s = drawInteractive("chance", 3, 5); // c6 diceMove
    s = { ...s, players: replaceForTest(s.players, 0, { position: 30 }) };
    s = rollCardDice(s, seqRng([3 / 6 + 0.001])); // 4 → 30+4=34 → 起點
    s = resolveCardDice(s, seqRng([0]), 0);
    expect(s.players[0].position).toBe(0);
    expect(s.players[0].money).toBe(8000 + DEFAULT_SETTINGS.passStartBonus);
  });

  it("quiz 答對：得獎金（機會 c7 +2000）", () => {
    const s = drawInteractive("chance", 3, 6); // c7 reward 2000
    expect(s.pendingAction?.kind).toBe("cardQuiz");
    const after = answerCardQuiz(s, true, 0);
    expect(after.players[0].money).toBe(8000 + 2000);
    expect(after.currentPlayerIndex).toBe(1);
  });

  it("quiz 答錯 money：罰款（命運 f6 −1000）", () => {
    const s = drawInteractive("fate", 6, 5); // f6 onWrong money 1000
    const after = answerCardQuiz(s, false, 0);
    expect(after.players[0].money).toBe(8000 - 1000);
  });

  it("quiz 答錯 jail：進監獄並暫停一回合（命運 f7）", () => {
    const s = drawInteractive("fate", 6, 6); // f7 onWrong jail
    const after = answerCardQuiz(s, false, 0);
    expect(after.players[0].skipTurns).toBe(1);
  });
});

describe("結束條件", () => {
  it("moneyGoal 達標立即結束、該玩家第一", () => {
    let s = startGame(
      {
        ...DEFAULT_SETTINGS,
        endCondition: { type: "moneyGoal", amount: 10000 },
      },
      Q,
      PLAYERS,
      0,
    );
    s = { ...s, players: replaceForTest(s.players, 0, { position: 3 }) };
    // 機會格抽 c1 +2000 → 8000+2000=10000 >= 10000
    s = resolveLanding(s, seqRng([0]), 0);
    s = drawAndApplyCard(s, seqRng([0]), 0);
    expect(s.phase).toBe("gameover");
    expect(ranking(s)[0].name).toBe("小明");
  });

  it("time 到 → 結束", () => {
    let s = startGame(
      { ...DEFAULT_SETTINGS, endCondition: { type: "time", minutes: 10 } },
      Q,
      PLAYERS,
      0,
    );
    // 經過 11 分鐘（毫秒）
    s = takeTurn(s, seqRng([0, 0]), 11 * 60 * 1000);
    expect(s.phase).toBe("gameover");
  });

  it("lastOneStanding：只剩一位非破產 → 結束", () => {
    let s = game();
    s = { ...s, players: replaceForTest(s.players, 1, { bankrupt: true }) };
    s = {
      ...s,
      settings: { ...s.settings, endCondition: { type: "lastOneStanding" } },
    };
    s = takeTurn(s, seqRng([0, 0]), 0); // p0 擲 1+1 落 start
    expect(s.phase).toBe("gameover");
  });

  it("ranking 依現金排序，同分比資產", () => {
    let s = game();
    s = {
      ...s,
      players: replaceForTest(s.players, 0, { money: 5000, ownedTiles: [1] }),
    };
    s = { ...s, players: replaceForTest(s.players, 1, { money: 5000 }) };
    expect(ranking(s)[0].name).toBe("小明"); // 同現金，p0 有資產
  });
});
