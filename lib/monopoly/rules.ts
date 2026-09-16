import { BOARD, BOARD_SIZE } from "./board";
import { deckOf } from "./cards";
import { pickIndex, rollOne, type Rng } from "./rng";
import type {
  Card,
  CutsceneEvent,
  GameSettings,
  GameState,
  Player,
  PlayerInput,
  PropertyTile,
  Question,
} from "./types";
import { buildCostFor, withinCap, isProperty, maxBuildLevel } from "./types";

const MAX_CHAIN = 10;

// 監獄格位置（供「進監獄」卡片直接移動棋子過去）
const JAIL_INDEX = BOARD.find((t) => t.type === "jail")?.index ?? 0;

// 過起點加碼問答答對的預設金額（老師可在設定改）；答錯則給 passStartBonus
export const PASS_START_QUIZ_BONUS = 3000;

// === 不可變工具 ===
function replacePlayer(
  players: Player[],
  index: number,
  patch: Partial<Player>,
): Player[] {
  return players.map((p, i) => (i === index ? { ...p, ...patch } : p));
}

// 分配式 Omit：保留 union 各成員的判別鍵
type DistributiveOmit<T, K extends keyof T> = T extends unknown
  ? Omit<T, K>
  : never;

// 把過場事件 append 進佇列（seq 由前一筆遞增，供 UI 依序播放並去重）。
// 一次行動可累積多筆（例如連抽卡），由 UI 逐一播完。保留最近 12 筆。
function withCutsceneEvent(
  state: GameState,
  ev: DistributiveOmit<CutsceneEvent, "seq">,
): GameState {
  const prev = state.cutsceneEvents ?? [];
  const seq = (prev.length ? prev[prev.length - 1].seq : 0) + 1;
  return {
    ...state,
    cutsceneEvents: [...prev, { ...ev, seq } as CutsceneEvent].slice(-12),
  };
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
    character: input.character,
    difficulty: input.difficulty ?? "normal",
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
  };
}

// === 回合流轉 ===
function nextPlayerIndex(state: GameState, from: number): number {
  const n = state.players.length;
  for (let step = 1; step <= n; step++) {
    const idx = (from + step) % n;
    if (!state.players[idx].bankrupt) return idx;
  }
  return from;
}

// === 結束條件與排名 ===
export function assetValue(state: GameState, player: Player): number {
  return player.ownedTiles.reduce((sum, ti) => {
    const tile = BOARD[ti] as PropertyTile;
    const level = player.houses[ti] ?? 0;
    const houseCount = Math.min(level, tile.maxHouses);
    const hotel = level > tile.maxHouses ? tile.hotelCost : 0;
    return sum + tile.price + houseCount * tile.houseCost + hotel;
  }, 0);
}

export function ranking(state: GameState): Player[] {
  return [...state.players].sort((a, b) => {
    if (b.money !== a.money) return b.money - a.money;
    return assetValue(state, b) - assetValue(state, a);
  });
}

function activePlayers(state: GameState): Player[] {
  return state.players.filter((p) => !p.bankrupt);
}

function isGameOver(state: GameState, now: number): boolean {
  const ec = state.settings.endCondition;
  switch (ec.type) {
    case "time":
      return (
        state.startedAt !== null &&
        now - state.startedAt >= ec.minutes * 60 * 1000
      );
    case "moneyGoal":
      return state.players.some((p) => p.money >= ec.amount);
    case "lastOneStanding":
      return activePlayers(state).length <= 1;
    case "laps":
      return Object.values(state.lapsByPlayer).some((l) => l >= ec.count);
    default:
      return false;
  }
}

export function checkEnd(state: GameState, now: number): GameState {
  if (isGameOver(state, now)) {
    return {
      ...state,
      phase: "gameover",
      pendingAction: null,
    };
  }
  return state;
}

// 結束目前回合：先檢查結束條件，否則清 pendingAction、輪到下一位非破產玩家
function endTurn(state: GameState, now: number): GameState {
  const ended = checkEnd(state, now);
  if (ended.phase === "gameover") return ended;
  const next = nextPlayerIndex(ended, ended.currentPlayerIndex);
  return { ...ended, pendingAction: null, currentPlayerIndex: next };
}

function drawQuestion(state: GameState, rng: Rng): Question {
  // 差異化教學開啟時抽輪到的學生難度「以下」的題；範圍內一題都沒有時退回整份題庫，免得卡住流程
  const cap = state.players[state.currentPlayerIndex].difficulty ?? "normal";
  const pool = state.settings.differentiated
    ? state.questions.filter((q) => withinCap(q, cap))
    : [];
  const from = pool.length > 0 ? pool : state.questions;
  return from[pickIndex(from.length, rng)];
}

// === 收款／破產 ===
// 向 payerIdx 收取 amount，付給 ownerId（ownerId 為 null 表示付給銀行）。
// 不足以支付 → 破產：付出全部現金、釋地、money=0、bankrupt=true。
function chargeOrBankrupt(
  state: GameState,
  payerIdx: number,
  amount: number,
  ownerId: string | null,
): GameState {
  const payer = state.players[payerIdx];
  let players = state.players;

  if (payer.money >= amount) {
    players = replacePlayer(players, payerIdx, { money: payer.money - amount });
    if (ownerId) {
      const oi = players.findIndex((p) => p.id === ownerId);
      players = replacePlayer(players, oi, {
        money: players[oi].money + amount,
      });
    }
  } else {
    const paid = payer.money;
    players = replacePlayer(players, payerIdx, {
      money: 0,
      bankrupt: true,
      ownedTiles: [],
      houses: {},
    });
    if (ownerId) {
      const oi = players.findIndex((p) => p.id === ownerId);
      players = replacePlayer(players, oi, { money: players[oi].money + paid });
    }
  }
  return { ...state, players };
}

// === 過路費 ===
function payToll(
  state: GameState,
  payerIdx: number,
  ownerId: string,
  prop: PropertyTile,
  now: number,
): GameState {
  const level =
    state.players.find((p) => p.id === ownerId)!.houses[prop.index] ?? 0;
  const toll = prop.toll[Math.min(level, prop.toll.length - 1)];
  const payerId = state.players[payerIdx].id;
  const charged = chargeOrBankrupt(state, payerIdx, toll, ownerId);
  return endTurn(
    withCutsceneEvent(charged, {
      kind: "toll",
      payerId,
      ownerId,
      amount: toll,
      tileName: prop.name,
    }),
    now,
  );
}

// 通過起點：先停下來出加碼題，圈數先 +1，結算（加錢）與後續落地延後到 answerPassStart。
// 傳入的 state 須已把棋子移到新位置、但尚未發放過起點獎勵。
// 老師關掉加碼題時直接發 passStartBonus、推 🏁 過場（走完棋才播），接著結算落點。
function goPassStart(state: GameState, rng: Rng, now: number): GameState {
  const idx = state.currentPlayerIndex;
  const player = state.players[idx];
  const lapsByPlayer = {
    ...state.lapsByPlayer,
    [player.id]: (state.lapsByPlayer[player.id] ?? 0) + 1,
  };
  if (state.settings.passStartQuiz === false) {
    const amount = state.settings.passStartBonus;
    const paid = withCutsceneEvent(
      {
        ...state,
        lapsByPlayer,
        players: replacePlayer(state.players, idx, {
          money: player.money + amount,
        }),
      },
      { kind: "passStart", playerId: player.id, amount },
    );
    return resolveLanding(paid, rng, now);
  }
  return {
    ...state,
    lapsByPlayer,
    pendingAction: {
      kind: "passStartQuestion",
      question: drawQuestion(state, rng),
      rewardRight: state.settings.passStartQuizBonus ?? PASS_START_QUIZ_BONUS,
      rewardWrong: state.settings.passStartBonus,
    },
  };
}

// 玩家作答過起點加碼題後結算：答對加碼、答錯給原本獎勵，播 🏁 過場後繼續落地。
export function answerPassStart(
  state: GameState,
  correct: boolean,
  rng: Rng,
  now: number,
): GameState {
  const pa = state.pendingAction;
  if (pa?.kind !== "passStartQuestion") return state;
  const idx = state.currentPlayerIndex;
  const player = state.players[idx];
  const reward = correct ? pa.rewardRight : pa.rewardWrong;
  const players = replacePlayer(state.players, idx, {
    money: player.money + reward,
  });
  // 🏁 加錢過場改由 UI 在答題當下立即播（棋子還停在起點），演完才續走，
  // 故這裡不推 cutsceneEvent，只結算金額後續結算落點。
  const next = { ...state, players, pendingAction: null };
  return resolveLanding(next, rng, now);
}

// === 落點判定 ===
// 對 current 玩家所在格產生 pendingAction 或自動結算
export function resolveLanding(
  state: GameState,
  rng: Rng,
  now: number,
): GameState {
  const idx = state.currentPlayerIndex;
  const player = state.players[idx];
  const tile = BOARD[player.position];

  switch (tile.type) {
    case "start":
      return endTurn(state, now);
    case "jail": {
      const players = replacePlayer(state.players, idx, {
        skipTurns: 1,
        skipReason: "jail",
      });
      return endTurn(
        withCutsceneEvent(
          { ...state, players },
          { kind: "skip", playerId: player.id, reason: "jail" },
        ),
        now,
      );
    }
    case "chance":
    case "fate": {
      const deck = deckOf(tile.type);
      const card = deck[pickIndex(deck.length, rng)];
      return {
        ...state,
        pendingAction: { kind: "drawCard", deck: tile.type, card },
      };
    }
    case "property": {
      const prop = tile as PropertyTile;
      const owner = state.players.find((p) =>
        p.ownedTiles.includes(prop.index),
      );
      if (!owner) {
        return {
          ...state,
          pendingAction: {
            kind: "buyQuestion",
            tileIndex: prop.index,
            question: drawQuestion(state, rng),
          },
        };
      }
      if (owner.id === player.id) {
        if ((player.houses[prop.index] ?? 0) >= maxBuildLevel(prop))
          return endTurn(state, now);
        return {
          ...state,
          pendingAction: {
            kind: "buildQuestion",
            tileIndex: prop.index,
            question: drawQuestion(state, rng),
          },
        };
      }
      // 別人的地：付過路費
      return payToll(state, idx, owner.id, prop, now);
    }
    default:
      return endTurn(state, now);
  }
}

// === 答題後買地/蓋房 ===
export function answerQuestion(
  state: GameState,
  correct: boolean,
  now: number,
): GameState {
  const pa = state.pendingAction;
  if (!pa || (pa.kind !== "buyQuestion" && pa.kind !== "buildQuestion"))
    return state;

  if (!correct) {
    return endTurn(state, now);
  }
  const nextKind = pa.kind === "buyQuestion" ? "confirmBuy" : "confirmBuild";
  return {
    ...state,
    pendingAction: { kind: nextKind, tileIndex: pa.tileIndex },
  };
}

export function confirmPurchase(
  state: GameState,
  accept: boolean,
  now: number,
): GameState {
  const pa = state.pendingAction;
  if (!pa || (pa.kind !== "confirmBuy" && pa.kind !== "confirmBuild"))
    return state;
  const idx = state.currentPlayerIndex;
  const player = state.players[idx];
  const tile = BOARD[pa.tileIndex];
  if (!isProperty(tile)) return endTurn(state, now);

  if (!accept) return endTurn(state, now);

  if (pa.kind === "confirmBuy") {
    if (player.money < tile.price) {
      return endTurn(state, now);
    }
    const players = replacePlayer(state.players, idx, {
      money: player.money - tile.price,
      ownedTiles: [...player.ownedTiles, tile.index],
    });
    return endTurn(
      withCutsceneEvent(
        {
          ...state,
          players,
        },
        {
          kind: "buy",
          playerId: player.id,
          amount: tile.price,
          tileName: tile.name,
        },
      ),
      now,
    );
  }

  // confirmBuild：current 為目前建設等級，蓋滿房子後再蓋即升旅館
  const current = player.houses[tile.index] ?? 0;
  const cost = buildCostFor(tile, current);
  if (current >= maxBuildLevel(tile) || player.money < cost) {
    return endTurn(state, now);
  }
  const players = replacePlayer(state.players, idx, {
    money: player.money - cost,
    houses: { ...player.houses, [tile.index]: current + 1 },
  });
  return endTurn(
    withCutsceneEvent(
      {
        ...state,
        players,
      },
      {
        kind: "build",
        playerId: player.id,
        amount: cost,
        tileName: tile.name,
      },
    ),
    now,
  );
}

// === 擲骰移動 ===
export function takeTurn(state: GameState, rng: Rng, now: number): GameState {
  // 回合開始先檢查結束條件（如時間到、只剩一位玩家）
  const preCheck = checkEnd(state, now);
  if (preCheck.phase === "gameover") return preCheck;

  const idx = state.currentPlayerIndex;
  const player = state.players[idx];

  if (player.skipTurns > 0) {
    const remaining = player.skipTurns - 1;
    const reason = player.skipReason ?? "rest";
    const players = replacePlayer(state.players, idx, {
      skipTurns: remaining,
      skipReason: remaining > 0 ? player.skipReason : undefined,
    });
    return endTurn(
      withCutsceneEvent(
        { ...state, players, lastRoll: null },
        { kind: "skip", playerId: player.id, reason },
      ),
      now,
    );
  }

  const dice = Array.from({ length: state.settings.diceCount }, () =>
    rollOne(rng),
  );
  const sum = dice.reduce((a, b) => a + b, 0);
  const newPos = (player.position + sum) % BOARD_SIZE;
  const passedStart = player.position + sum >= BOARD_SIZE;

  const players = replacePlayer(state.players, idx, { position: newPos });
  const moved: GameState = { ...state, players, lastRoll: dice };

  // 過起點：先出加碼題，獎勵與落地延後到玩家作答完
  if (passedStart) return goPassStart(moved, rng, now);
  return resolveLanding(moved, rng, now);
}

// === 機會/命運卡片效果 ===
function applyCardEffect(
  state: GameState,
  card: Card,
  rng: Rng,
  now: number,
): GameState {
  const idx = state.currentPlayerIndex;
  const player = state.players[idx];

  switch (card.effect.kind) {
    // 互動式卡片：先把舞台交給玩家（擲骰／答題），結算延後到玩家操作完成
    case "diceReward":
    case "diceMove":
    case "diceBet":
      return {
        ...state,
        pendingAction: { kind: "cardDice", card, rolled: null },
      };
    case "quiz":
      return {
        ...state,
        pendingAction: {
          kind: "cardQuiz",
          card,
          question: drawQuestion(state, rng),
        },
      };
    case "money": {
      const amt = card.effect.amount;
      const cardEv = {
        kind: "card" as const,
        playerId: player.id,
        amount: amt,
        deck: card.deck,
        text: card.text,
      };
      if (amt >= 0) {
        const players = replacePlayer(state.players, idx, {
          money: player.money + amt,
        });
        return endTurn(withCutsceneEvent({ ...state, players }, cardEv), now);
      }
      return endTurn(
        withCutsceneEvent(chargeOrBankrupt(state, idx, -amt, null), cardEv),
        now,
      );
    }
    case "jail": {
      // 直接移動棋子到監獄格，並暫停一回合
      const players = replacePlayer(state.players, idx, {
        position: JAIL_INDEX,
        skipTurns: 1,
        skipReason: "jail",
      });
      return endTurn(
        withCutsceneEvent(
          {
            ...state,
            players,
          },
          { kind: "skip", playerId: player.id, reason: "jail" },
        ),
        now,
      );
    }
    case "skip": {
      const players = replacePlayer(state.players, idx, {
        skipTurns: 1,
        skipReason: "rest",
      });
      return endTurn(
        {
          ...state,
          players,
        },
        now,
      );
    }
    case "move":
    case "moveTo": {
      const newPos =
        card.effect.kind === "move"
          ? (((player.position + card.effect.steps) % BOARD_SIZE) +
              BOARD_SIZE) %
            BOARD_SIZE
          : card.effect.tileIndex;
      const passedStart =
        card.effect.kind === "move" &&
        card.effect.steps > 0 &&
        player.position + card.effect.steps >= BOARD_SIZE;
      const players = replacePlayer(state.players, idx, { position: newPos });
      const moved: GameState = {
        ...state,
        players,
        pendingAction: null,
      };
      // 過起點先出加碼題；否則直接重新結算落點（連鎖）
      if (passedStart) return goPassStart(moved, rng, now);
      return resolveLanding(moved, rng, now);
    }
    default:
      return endTurn(state, now);
  }
}

export function drawAndApplyCard(
  state: GameState,
  rng: Rng,
  now: number,
): GameState {
  let s = state;
  let chain = 0;
  while (s.pendingAction?.kind === "drawCard") {
    if (chain >= MAX_CHAIN) {
      return endTurn(s, now);
    }
    const card = s.pendingAction.card;
    s = applyCardEffect({ ...s, pendingAction: null }, card, rng, now);
    chain++;
  }
  return s;
}

// === 互動擲骰卡 ===
// 玩家按下「擲骰子」：擲一顆骰並記錄點數供 UI 顯示（先不套用效果，讓玩家看到結果）。
export function rollCardDice(state: GameState, rng: Rng): GameState {
  const pa = state.pendingAction;
  if (pa?.kind !== "cardDice" || pa.rolled !== null) return state;
  const rolled = rollOne(rng);
  return { ...state, pendingAction: { ...pa, rolled } };
}

// 擲完後按「確定」：依骰出的點數套用卡片效果。
export function resolveCardDice(
  state: GameState,
  rng: Rng,
  now: number,
): GameState {
  const pa = state.pendingAction;
  if (pa?.kind !== "cardDice" || pa.rolled === null) return state;
  const idx = state.currentPlayerIndex;
  const player = state.players[idx];
  const v = pa.rolled;
  const { card } = pa;
  const base = { ...state, pendingAction: null };

  const cardEvent = (amount: number, text: string) => ({
    kind: "card" as const,
    playerId: player.id,
    amount,
    deck: card.deck,
    text,
  });

  switch (card.effect.kind) {
    case "diceReward": {
      const amount = v * card.effect.perPip;
      if (amount >= 0) {
        const players = replacePlayer(base.players, idx, {
          money: player.money + amount,
        });
        return endTurn(
          withCutsceneEvent(
            { ...base, players },
            cardEvent(amount, `擲出 ${v}，獲得 $${amount}`),
          ),
          now,
        );
      }
      return endTurn(
        withCutsceneEvent(
          chargeOrBankrupt(base, idx, -amount, null),
          cardEvent(amount, `擲出 ${v}，罰款 $${-amount}`),
        ),
        now,
      );
    }
    case "diceBet": {
      const win = v % 2 === 1; // 單數贏、雙數輸
      const amount = card.effect.amount;
      if (win) {
        const players = replacePlayer(base.players, idx, {
          money: player.money + amount,
        });
        return endTurn(
          withCutsceneEvent(
            { ...base, players },
            cardEvent(amount, `擲出 ${v}，單數贏得 $${amount}`),
          ),
          now,
        );
      }
      return endTurn(
        withCutsceneEvent(
          chargeOrBankrupt(base, idx, amount, null),
          cardEvent(-amount, `擲出 ${v}，雙數賠了 $${amount}`),
        ),
        now,
      );
    }
    case "diceMove": {
      const newPos = (player.position + v) % BOARD_SIZE;
      const passedStart = player.position + v >= BOARD_SIZE;
      const players = replacePlayer(base.players, idx, { position: newPos });
      const moved: GameState = { ...base, players, pendingAction: null };
      if (passedStart) return goPassStart(moved, rng, now);
      return resolveLanding(moved, rng, now);
    }
    default:
      return endTurn(base, now);
  }
}

// === 互動答題卡 ===
// 玩家作答後結算：答對得獎金；答錯依 onWrong 罰款或進監獄。
export function answerCardQuiz(
  state: GameState,
  correct: boolean,
  now: number,
): GameState {
  const pa = state.pendingAction;
  if (pa?.kind !== "cardQuiz") return state;
  const idx = state.currentPlayerIndex;
  const player = state.players[idx];
  const { card } = pa;
  const base = { ...state, pendingAction: null };
  if (card.effect.kind !== "quiz") return endTurn(base, now);

  const cardEvent = (amount: number, text: string) => ({
    kind: "card" as const,
    playerId: player.id,
    amount,
    deck: card.deck,
    text,
  });

  if (correct) {
    const reward = card.effect.reward;
    if (reward <= 0) return endTurn(base, now);
    const players = replacePlayer(base.players, idx, {
      money: player.money + reward,
    });
    return endTurn(
      withCutsceneEvent(
        { ...base, players },
        cardEvent(reward, `答對了！獲得 $${reward}`),
      ),
      now,
    );
  }

  // 答錯
  const onWrong = card.effect.onWrong;
  if (onWrong.kind === "jail") {
    const players = replacePlayer(base.players, idx, {
      position: JAIL_INDEX,
      skipTurns: 1,
      skipReason: "jail",
    });
    return endTurn(
      withCutsceneEvent(
        {
          ...base,
          players,
        },
        { kind: "skip", playerId: player.id, reason: "jail" },
      ),
      now,
    );
  }
  if (onWrong.amount <= 0) {
    return endTurn(base, now);
  }
  return endTurn(
    withCutsceneEvent(
      chargeOrBankrupt(base, idx, onWrong.amount, null),
      cardEvent(-onWrong.amount, `答錯了…罰款 $${onWrong.amount}`),
    ),
    now,
  );
}
