import { BOARD, BOARD_SIZE } from "./board";
import { deckOf } from "./cards";
import { pickIndex, rollOne, type Rng } from "./rng";
import type {
  GameSettings,
  GameState,
  Player,
  PlayerInput,
  PropertyTile,
  Question,
} from "./types";
import { isProperty } from "./types";

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

// 結束目前回合：清 pendingAction、輪到下一位非破產玩家
// （checkEnd 與排名在 Task 11 補上）
function endTurn(state: GameState): GameState {
  const next = nextPlayerIndex(state, state.currentPlayerIndex);
  return { ...state, pendingAction: null, currentPlayerIndex: next };
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
): GameState {
  const houses =
    state.players.find((p) => p.id === ownerId)!.houses[prop.index] ?? 0;
  const toll = prop.toll[houses];
  return endTurn(chargeOrBankrupt(state, payerIdx, toll, ownerId));
}

// === 落點判定 ===
// 對 current 玩家所在格產生 pendingAction 或自動結算
export function resolveLanding(state: GameState, rng: Rng): GameState {
  const idx = state.currentPlayerIndex;
  const player = state.players[idx];
  const tile = BOARD[player.position];

  switch (tile.type) {
    case "start":
      return endTurn(state);
    case "jail": {
      const players = replacePlayer(state.players, idx, { skipTurns: 1 });
      const log = addLog(state.log, `${player.name} 進入監獄，暫停一回合`);
      return endTurn({ ...state, players, log });
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
          return endTurn(state);
        return {
          ...state,
          pendingAction: {
            kind: "buildQuestion",
            tileIndex: prop.index,
            question: drawQuestion(state, rng),
          },
        };
      }
      // 別人的地：付過路費（破產強化在 Task 9）
      return payToll(state, idx, owner.id, prop);
    }
    default:
      return endTurn(state);
  }
}

// === 答題後買地/蓋房 ===
export function answerQuestion(state: GameState, correct: boolean): GameState {
  const pa = state.pendingAction;
  if (!pa || (pa.kind !== "buyQuestion" && pa.kind !== "buildQuestion"))
    return state;
  const player = state.players[state.currentPlayerIndex];

  if (!correct) {
    const log = addLog(
      state.log,
      `${player.name} 答錯，無法${pa.kind === "buyQuestion" ? "購買" : "蓋房"}`,
    );
    return endTurn({ ...state, log });
  }
  const nextKind = pa.kind === "buyQuestion" ? "confirmBuy" : "confirmBuild";
  return {
    ...state,
    pendingAction: { kind: nextKind, tileIndex: pa.tileIndex },
    log: addLog(state.log, `${player.name} 答對了！`),
  };
}

export function confirmPurchase(state: GameState, accept: boolean): GameState {
  const pa = state.pendingAction;
  if (!pa || (pa.kind !== "confirmBuy" && pa.kind !== "confirmBuild"))
    return state;
  const idx = state.currentPlayerIndex;
  const player = state.players[idx];
  const tile = BOARD[pa.tileIndex];
  if (!isProperty(tile)) return endTurn(state);

  if (!accept) return endTurn(state);

  if (pa.kind === "confirmBuy") {
    if (player.money < tile.price) {
      return endTurn({
        ...state,
        log: addLog(state.log, `${player.name} 金錢不足，無法購買`),
      });
    }
    const players = replacePlayer(state.players, idx, {
      money: player.money - tile.price,
      ownedTiles: [...player.ownedTiles, tile.index],
    });
    return endTurn({
      ...state,
      players,
      log: addLog(state.log, `${player.name} 購買了 ${tile.name}`),
    });
  }

  // confirmBuild
  const current = player.houses[tile.index] ?? 0;
  if (current >= tile.maxHouses || player.money < tile.houseCost) {
    return endTurn({
      ...state,
      log: addLog(state.log, `${player.name} 無法蓋房`),
    });
  }
  const players = replacePlayer(state.players, idx, {
    money: player.money - tile.houseCost,
    houses: { ...player.houses, [tile.index]: current + 1 },
  });
  return endTurn({
    ...state,
    players,
    log: addLog(state.log, `${player.name} 在 ${tile.name} 蓋了一棟房子`),
  });
}

// === 擲骰移動 ===
export function takeTurn(state: GameState, rng: Rng): GameState {
  const idx = state.currentPlayerIndex;
  const player = state.players[idx];

  if (player.skipTurns > 0) {
    const players = replacePlayer(state.players, idx, {
      skipTurns: player.skipTurns - 1,
    });
    const log = addLog(state.log, `${player.name} 暫停一回合`);
    return endTurn({ ...state, players, log, lastRoll: null });
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
  return resolveLanding(moved, rng);
}
