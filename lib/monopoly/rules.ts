import { BOARD, BOARD_SIZE } from "./board";
import { deckOf } from "./cards";
import { pickIndex, rollOne, type Rng } from "./rng";
import type {
  Card,
  GameSettings,
  GameState,
  Player,
  PlayerInput,
  PropertyTile,
  Question,
} from "./types";
import { isProperty } from "./types";

const MAX_CHAIN = 10;

// === 不可變工具 ===
function replacePlayer(
  players: Player[],
  index: number,
  patch: Partial<Player>,
): Player[] {
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
    const houses = player.houses[ti] ?? 0;
    return sum + tile.price + houses * tile.houseCost;
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

function checkEnd(state: GameState, now: number): GameState {
  if (isGameOver(state, now)) {
    return {
      ...state,
      phase: "gameover",
      pendingAction: null,
      log: addLog(state.log, "遊戲結束！"),
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
  return state.questions[pickIndex(state.questions.length, rng)];
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
  let log = state.log;

  if (payer.money >= amount) {
    players = replacePlayer(players, payerIdx, { money: payer.money - amount });
    if (ownerId) {
      const oi = players.findIndex((p) => p.id === ownerId);
      players = replacePlayer(players, oi, {
        money: players[oi].money + amount,
      });
    }
    log = addLog(log, `${payer.name} 支付 $${amount}`);
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
    log = addLog(log, `${payer.name} 破產了！`);
  }
  return { ...state, players, log };
}

// === 過路費 ===
function payToll(
  state: GameState,
  payerIdx: number,
  ownerId: string,
  prop: PropertyTile,
  now: number,
): GameState {
  const houses =
    state.players.find((p) => p.id === ownerId)!.houses[prop.index] ?? 0;
  const toll = prop.toll[houses];
  return endTurn(chargeOrBankrupt(state, payerIdx, toll, ownerId), now);
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
      const players = replacePlayer(state.players, idx, { skipTurns: 1 });
      const log = addLog(state.log, `${player.name} 進入監獄，暫停一回合`);
      return endTurn({ ...state, players, log }, now);
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
        if ((player.houses[prop.index] ?? 0) >= prop.maxHouses)
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
  const player = state.players[state.currentPlayerIndex];

  if (!correct) {
    const log = addLog(
      state.log,
      `${player.name} 答錯，無法${pa.kind === "buyQuestion" ? "購買" : "蓋房"}`,
    );
    return endTurn({ ...state, log }, now);
  }
  const nextKind = pa.kind === "buyQuestion" ? "confirmBuy" : "confirmBuild";
  return {
    ...state,
    pendingAction: { kind: nextKind, tileIndex: pa.tileIndex },
    log: addLog(state.log, `${player.name} 答對了！`),
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
      return endTurn(
        {
          ...state,
          log: addLog(state.log, `${player.name} 金錢不足，無法購買`),
        },
        now,
      );
    }
    const players = replacePlayer(state.players, idx, {
      money: player.money - tile.price,
      ownedTiles: [...player.ownedTiles, tile.index],
    });
    return endTurn(
      {
        ...state,
        players,
        log: addLog(state.log, `${player.name} 購買了 ${tile.name}`),
      },
      now,
    );
  }

  // confirmBuild
  const current = player.houses[tile.index] ?? 0;
  if (current >= tile.maxHouses || player.money < tile.houseCost) {
    return endTurn(
      {
        ...state,
        log: addLog(state.log, `${player.name} 無法蓋房`),
      },
      now,
    );
  }
  const players = replacePlayer(state.players, idx, {
    money: player.money - tile.houseCost,
    houses: { ...player.houses, [tile.index]: current + 1 },
  });
  return endTurn(
    {
      ...state,
      players,
      log: addLog(state.log, `${player.name} 在 ${tile.name} 蓋了一棟房子`),
    },
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
    const players = replacePlayer(state.players, idx, {
      skipTurns: player.skipTurns - 1,
    });
    const log = addLog(state.log, `${player.name} 暫停一回合`);
    return endTurn({ ...state, players, log, lastRoll: null }, now);
  }

  const dice = Array.from({ length: state.settings.diceCount }, () =>
    rollOne(rng),
  );
  const sum = dice.reduce((a, b) => a + b, 0);
  const newPos = (player.position + sum) % BOARD_SIZE;
  const passedStart = player.position + sum >= BOARD_SIZE;

  let players = replacePlayer(state.players, idx, { position: newPos });
  let lapsByPlayer = state.lapsByPlayer;
  let log = addLog(state.log, `${player.name} 擲出 ${dice.join("+")}=${sum}`);

  if (passedStart) {
    players = replacePlayer(players, idx, {
      money: players[idx].money + state.settings.passStartBonus,
    });
    lapsByPlayer = {
      ...lapsByPlayer,
      [player.id]: (lapsByPlayer[player.id] ?? 0) + 1,
    };
    log = addLog(
      log,
      `${player.name} 經過起點 +$${state.settings.passStartBonus}`,
    );
  }

  const moved: GameState = {
    ...state,
    players,
    lapsByPlayer,
    lastRoll: dice,
    log,
  };
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
  const log0 = addLog(state.log, `${player.name} 抽到「${card.text}」`);

  switch (card.effect.kind) {
    case "money": {
      const amt = card.effect.amount;
      if (amt >= 0) {
        const players = replacePlayer(state.players, idx, {
          money: player.money + amt,
        });
        return endTurn({ ...state, players, log: log0 }, now);
      }
      return endTurn(
        chargeOrBankrupt({ ...state, log: log0 }, idx, -amt, null),
        now,
      );
    }
    case "jail": {
      const players = replacePlayer(state.players, idx, { skipTurns: 1 });
      return endTurn(
        {
          ...state,
          players,
          log: addLog(log0, `${player.name} 進入監獄`),
        },
        now,
      );
    }
    case "skip": {
      const players = replacePlayer(state.players, idx, { skipTurns: 1 });
      return endTurn(
        {
          ...state,
          players,
          log: addLog(log0, `${player.name} 暫停一回合`),
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
      let players = replacePlayer(state.players, idx, { position: newPos });
      let lapsByPlayer = state.lapsByPlayer;
      let log = log0;
      if (passedStart) {
        players = replacePlayer(players, idx, {
          money: players[idx].money + state.settings.passStartBonus,
        });
        lapsByPlayer = {
          ...lapsByPlayer,
          [player.id]: (lapsByPlayer[player.id] ?? 0) + 1,
        };
        log = addLog(
          log,
          `${player.name} 經過起點 +$${state.settings.passStartBonus}`,
        );
      }
      // 移動後重新結算落點（連鎖）
      return resolveLanding(
        { ...state, players, lapsByPlayer, log, pendingAction: null },
        rng,
        now,
      );
    }
    default:
      return endTurn({ ...state, log: log0 }, now);
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
      return endTurn(
        { ...s, log: addLog(s.log, "連鎖過多，強制結束回合") },
        now,
      );
    }
    const card = s.pendingAction.card;
    s = applyCardEffect({ ...s, pendingAction: null }, card, rng, now);
    chain++;
  }
  return s;
}
