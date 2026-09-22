import type { Rng } from "@/lib/monopoly/rng";
import {
  withinCap,
  type Difficulty,
  type Question,
} from "@/lib/questions/types";

export type Side = "red" | "blue";
export type Cell = Side | null;
export type Phase = "ready" | "countdown" | "quiz" | "move" | "over";

export const SIDES: Side[] = ["red", "blue"];
export const BOOLEAN_OPTIONS = ["是", "否"];
export const WINNING_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
] as const;

export interface Feedback {
  correct: boolean;
  choice: string;
}

export interface Lane {
  queue: Question[];
  index: number;
  current: Question | null;
  /** 下一題與對方目前題目相同時先不顯示，等對方換題。 */
  waiting: boolean;
  exhausted: boolean;
  cooldown: number;
  feedback: Feedback | null;
}

export interface GameState {
  phase: Phase;
  countdown: number | null;
  ready: Record<Side, boolean>;
  board: Cell[];
  lanes: Record<Side, Lane>;
  movingSide: Side | null;
  selectedFrom: number | null;
  result: Side | "draw" | null;
  winningLine: number[] | null;
}

export const other = (side: Side): Side => (side === "red" ? "blue" : "red");

export const optionsOf = (question: Question) =>
  question.type === "boolean" ? BOOLEAN_OPTIONS : (question.options ?? []);

export function playableOf(bank: Question[], cap: Difficulty = "hard") {
  return bank.filter(
    (question) => question.type !== "short" && withinCap(question, cap),
  );
}

function shuffle<T>(items: T[], rng: Rng): T[] {
  const out = [...items];
  for (let index = out.length - 1; index > 0; index--) {
    const target = Math.floor(rng() * (index + 1));
    [out[index], out[target]] = [out[target], out[index]];
  }
  return out;
}

function distinctQueues(bank: Question[], cap: Difficulty, rng: Rng) {
  const pool = playableOf(bank, cap);
  const red = shuffle(pool, rng);
  const blue = shuffle(pool, rng);
  if (red.length > 1 && red[0]?.id === blue[0]?.id) {
    const different = blue.findIndex((question) => question.id !== red[0]?.id);
    if (different > 0) [blue[0], blue[different]] = [blue[different], blue[0]];
  }
  return { red, blue };
}

function lane(queue: Question[]): Lane {
  return {
    queue,
    index: 0,
    current: queue[0] ?? null,
    waiting: false,
    exhausted: queue.length === 0,
    cooldown: 0,
    feedback: null,
  };
}

export function createGame(
  bank: Question[],
  cap: Difficulty,
  rng: Rng,
): GameState {
  const queues = distinctQueues(bank, cap, rng);
  return {
    phase: "ready",
    countdown: null,
    ready: { red: false, blue: false },
    board: Array<Cell>(9).fill(null),
    lanes: { red: lane(queues.red), blue: lane(queues.blue) },
    movingSide: null,
    selectedFrom: null,
    result: null,
    winningLine: null,
  };
}

export function markReady(state: GameState, side: Side): GameState {
  if (state.phase !== "ready" || state.ready[side]) return state;
  const ready = { ...state.ready, [side]: true };
  if (ready.red && ready.blue) {
    return { ...state, ready, phase: "countdown", countdown: 3 };
  }
  return { ...state, ready };
}

export function tickCountdown(state: GameState): GameState {
  if (state.phase !== "countdown" || state.countdown === null) return state;
  if (state.countdown > 1) return { ...state, countdown: state.countdown - 1 };
  return { ...state, phase: "quiz", countdown: null };
}

function finishIfExhausted(state: GameState): GameState {
  if (
    state.phase !== "over" &&
    state.lanes.red.exhausted &&
    state.lanes.blue.exhausted
  ) {
    return {
      ...state,
      phase: "over",
      countdown: null,
      movingSide: null,
      selectedFrom: null,
      result: "draw",
    };
  }
  return state;
}

function revealWaiting(lanes: Record<Side, Lane>, side: Side) {
  const current = lanes[side];
  if (!current.waiting || current.exhausted) return lanes;
  const candidate = current.queue[current.index] ?? null;
  const opposing = lanes[other(side)].current;
  if (candidate && candidate.id === opposing?.id) return lanes;
  return {
    ...lanes,
    [side]: {
      ...current,
      current: candidate,
      waiting: false,
      exhausted: candidate === null,
    },
  };
}

function advanceLane(state: GameState, side: Side): GameState {
  const current = state.lanes[side];
  const index = current.index + 1;
  const queue = [...current.queue];
  const opposingId = state.lanes[other(side)].current?.id;
  let candidate = queue[index] ?? null;
  if (candidate?.id === opposingId) {
    const alternate = queue.findIndex(
      (question, position) => position > index && question.id !== opposingId,
    );
    if (alternate > index) {
      [queue[index], queue[alternate]] = [queue[alternate], queue[index]];
      candidate = queue[index];
    }
  }
  const collision = candidate?.id === opposingId;
  let lanes: Record<Side, Lane> = {
    ...state.lanes,
    [side]: {
      ...current,
      queue,
      index,
      current: collision ? null : candidate,
      waiting: Boolean(collision),
      exhausted: candidate === null,
      cooldown: 0,
      feedback: null,
    },
  };
  lanes = revealWaiting(lanes, other(side));
  lanes = revealWaiting(lanes, side);
  return finishIfExhausted({ ...state, lanes });
}

export function answerQuestion(
  state: GameState,
  side: Side,
  choice: string,
): GameState {
  const laneState = state.lanes[side];
  if (
    state.phase !== "quiz" ||
    !laneState.current ||
    laneState.cooldown > 0 ||
    laneState.feedback
  ) {
    return state;
  }

  const correct = choice === laneState.current.answer;
  const lanes = {
    ...state.lanes,
    [side]: {
      ...laneState,
      feedback: { correct, choice },
      cooldown: correct ? 0 : 3,
    },
  };
  if (!correct) return { ...state, lanes };
  return {
    ...state,
    lanes,
    phase: "move",
    movingSide: side,
    selectedFrom: null,
  };
}

export function tickCooldown(state: GameState, side: Side): GameState {
  if (state.phase !== "quiz") return state;
  const laneState = state.lanes[side];
  if (laneState.cooldown <= 0) return finishIfExhausted(state);
  if (laneState.cooldown > 1) {
    return {
      ...state,
      lanes: {
        ...state.lanes,
        [side]: { ...laneState, cooldown: laneState.cooldown - 1 },
      },
    };
  }
  return advanceLane(state, side);
}

export const countPieces = (board: Cell[], side: Side) =>
  board.filter((cell) => cell === side).length;

export function winningLineOf(board: Cell[], side: Side): number[] | null {
  const line = WINNING_LINES.find((indices) =>
    indices.every((index) => board[index] === side),
  );
  return line ? [...line] : null;
}

function commitMove(state: GameState, board: Cell[]): GameState {
  const side = state.movingSide!;
  const winningLine = winningLineOf(board, side);
  if (winningLine) {
    return {
      ...state,
      board,
      phase: "over",
      movingSide: null,
      selectedFrom: null,
      result: side,
      winningLine,
    };
  }
  const advanced = advanceLane(
    {
      ...state,
      board,
      phase: "quiz",
      movingSide: null,
      selectedFrom: null,
    },
    side,
  );
  return finishIfExhausted(advanced);
}

export function chooseCell(state: GameState, index: number): GameState {
  const side = state.movingSide;
  if (state.phase !== "move" || !side || index < 0 || index >= 9) return state;

  const cell = state.board[index];
  if (countPieces(state.board, side) < 3) {
    if (cell !== null) return state;
    const board = [...state.board];
    board[index] = side;
    return commitMove(state, board);
  }

  if (state.selectedFrom === null) {
    return cell === side ? { ...state, selectedFrom: index } : state;
  }
  if (cell === side) return { ...state, selectedFrom: index };
  if (cell !== null) return state;

  const board = [...state.board];
  board[state.selectedFrom] = null;
  board[index] = side;
  return commitMove(state, board);
}

export function endAsDraw(state: GameState): GameState {
  if (state.phase === "over") return state;
  return {
    ...state,
    phase: "over",
    countdown: null,
    movingSide: null,
    selectedFrom: null,
    result: "draw",
    winningLine: null,
  };
}
