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
import { buildCostFor, isProperty, maxBuildLevel } from "./types";

const MAX_CHAIN = 10;

// 監獄格位置（供「進監獄」卡片直接移動棋子過去）
const JAIL_INDEX = BOARD.find((t) => t.type === "jail")?.index ?? 0;

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
      const log = addLog(state.log, `${player.name} 進入監獄，暫停一回合`);
      return endTurn(
        withCutsceneEvent(
          { ...state, players, log },
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
      withCutsceneEvent(
        {
          ...state,
          players,
          log: addLog(state.log, `${player.name} 購買了 ${tile.name}`),
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
  const toHotel = current + 1 > tile.maxHouses;
  if (current >= maxBuildLevel(tile) || player.money < cost) {
    return endTurn(
      {
        ...state,
        log: addLog(
          state.log,
          `${player.name} 無法${toHotel ? "蓋旅館" : "蓋房"}`,
        ),
      },
      now,
    );
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
        log: addLog(
          state.log,
          `${player.name} 在 ${tile.name} ${toHotel ? "蓋了旅館" : "蓋了一棟房子"}`,
        ),
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
    const log = addLog(state.log, `${player.name} 暫停一回合`);
    return endTurn(
      withCutsceneEvent(
        { ...state, players, log, lastRoll: null },
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

  // 過起點獎勵金已在上面入帳；+2000 過場改由 UI 在「走到起點那一刻」觸發
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
    // 互動式卡片：先把舞台交給玩家（擲骰／答題），結算延後到玩家操作完成
    case "diceReward":
    case "diceMove":
    case "diceBet":
      return {
        ...state,
        log: log0,
        pendingAction: { kind: "cardDice", card, rolled: null },
      };
    case "quiz":
      return {
        ...state,
        log: log0,
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
        return endTurn(
          withCutsceneEvent({ ...state, players, log: log0 }, cardEv),
          now,
        );
      }
      return endTurn(
        withCutsceneEvent(
          chargeOrBankrupt({ ...state, log: log0 }, idx, -amt, null),
          cardEv,
        ),
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
            log: addLog(log0, `${player.name} 進入監獄`),
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
      const log = addLog(
        base.log,
        `${player.name} 擲出 ${v}，${amount >= 0 ? `獲得 $${amount}` : `罰款 $${-amount}`}`,
      );
      if (amount >= 0) {
        const players = replacePlayer(base.players, idx, {
          money: player.money + amount,
        });
        return endTurn(
          withCutsceneEvent(
            { ...base, players, log },
            cardEvent(amount, `擲出 ${v}，獲得 $${amount}`),
          ),
          now,
        );
      }
      return endTurn(
        withCutsceneEvent(
          chargeOrBankrupt({ ...base, log }, idx, -amount, null),
          cardEvent(amount, `擲出 ${v}，罰款 $${-amount}`),
        ),
        now,
      );
    }
    case "diceBet": {
      const win = v % 2 === 1; // 單數贏、雙數輸
      const amount = card.effect.amount;
      const log = addLog(
        base.log,
        `${player.name} 擲出 ${v}（${win ? "單數" : "雙數"}），${win ? `贏得 $${amount}` : `賠了 $${amount}`}`,
      );
      if (win) {
        const players = replacePlayer(base.players, idx, {
          money: player.money + amount,
        });
        return endTurn(
          withCutsceneEvent(
            { ...base, players, log },
            cardEvent(amount, `擲出 ${v}，單數贏得 $${amount}`),
          ),
          now,
        );
      }
      return endTurn(
        withCutsceneEvent(
          chargeOrBankrupt({ ...base, log }, idx, amount, null),
          cardEvent(-amount, `擲出 ${v}，雙數賠了 $${amount}`),
        ),
        now,
      );
    }
    case "diceMove": {
      const newPos = (player.position + v) % BOARD_SIZE;
      const passedStart = player.position + v >= BOARD_SIZE;
      let players = replacePlayer(base.players, idx, { position: newPos });
      let lapsByPlayer = base.lapsByPlayer;
      let log = addLog(base.log, `${player.name} 擲出 ${v}，前進 ${v} 格`);
      if (passedStart) {
        players = replacePlayer(players, idx, {
          money: players[idx].money + base.settings.passStartBonus,
        });
        lapsByPlayer = {
          ...lapsByPlayer,
          [player.id]: (lapsByPlayer[player.id] ?? 0) + 1,
        };
        log = addLog(
          log,
          `${player.name} 經過起點 +$${base.settings.passStartBonus}`,
        );
      }
      return resolveLanding({ ...base, players, lapsByPlayer, log }, rng, now);
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
    const log = addLog(
      base.log,
      reward > 0
        ? `${player.name} 答對，獲得 $${reward}`
        : `${player.name} 答對，安全過關`,
    );
    if (reward <= 0) return endTurn({ ...base, log }, now);
    const players = replacePlayer(base.players, idx, {
      money: player.money + reward,
    });
    return endTurn(
      withCutsceneEvent(
        { ...base, players, log },
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
          log: addLog(base.log, `${player.name} 答錯，被關進監獄`),
        },
        { kind: "skip", playerId: player.id, reason: "jail" },
      ),
      now,
    );
  }
  if (onWrong.amount <= 0) {
    return endTurn(
      { ...base, log: addLog(base.log, `${player.name} 答錯，但無須受罰`) },
      now,
    );
  }
  const log = addLog(base.log, `${player.name} 答錯，罰款 $${onWrong.amount}`);
  return endTurn(
    withCutsceneEvent(
      chargeOrBankrupt({ ...base, log }, idx, onWrong.amount, null),
      cardEvent(-onWrong.amount, `答錯了…罰款 $${onWrong.amount}`),
    ),
    now,
  );
}
