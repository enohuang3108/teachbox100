import type { Rng } from "@/lib/monopoly/rng";
import {
  difficultyOf,
  withinCap,
  type Difficulty,
  type Question,
} from "@/lib/questions/types";

/** 固定兩隊：left 是藍隊、從左上角出發；right 是紅隊、從右下角出發 */
export type Side = "left" | "right";

export const SIDES: Side[] = ["left", "right"];

export const other = (side: Side): Side =>
  side === "left" ? "right" : "left";

/** 一格目前是誰的；null 是中立格 */
export type Owner = Side | null;

export interface Board {
  cols: number;
  rows: number;
  /** 由左到右、由上到下 */
  cells: Owner[];
}

/** 答錯固定讓對方暈開這麼多格，與難度無關 */
export const WRONG_CELLS = 1;

/** 答對可暈開的格數，由題目難度決定 */
export const CELL_VALUE: Record<Difficulty, number> = {
  easy: 1,
  normal: 2,
  hard: 3,
};

export const cellValue = (q: Question) => CELL_VALUE[difficultyOf(q)];

/**
 * 棋盤總格數，由這局能出的題數決定。
 *
 * 一局分兩段：搶中立格（每題平均暈開約 2 格，要 N/2 題），
 * 再互吃到一隊吃光（實力相近時像亂走，淨吃 N/2 格約要 (N/4)² 題）。
 * 兩段加起來抓題數的 7 成，留 3 成讓打不完的局用格數收尾：
 * N/2 + (N/4)² = 0.7Q → N = 4(√(0.7Q + 1) − 1)
 */
export function cellCount(questions: number): number {
  return Math.max(6, Math.round(4 * (Math.sqrt(0.7 * questions + 1) - 1)));
}

/** 場地大小：自動照題數算，其他是固定的目標格數；排成幾乘幾照螢幕比例挑，設定畫面直接顯示結果 */
export const BOARD_SIZES = {
  auto: { label: "自動", cells: null },
  small: { label: "小", cells: 12 },
  medium: { label: "中", cells: 20 },
  large: { label: "大", cells: 35 },
} as const;
export type BoardSize = keyof typeof BOARD_SIZES;

export function boardCells(size: BoardSize, questions: number): number {
  return BOARD_SIZES[size].cells ?? cellCount(questions);
}

/**
 * 棋盤鋪滿畫面（寬 / 高 = aspect），所以能選的只有行列數：
 * 格數不少於 n、最多多 25%，行列都至少 3（5×2 那種長條像走廊，兩隊一下就撞上），
 * 在這個範圍裡挑格子最接近正方形的；一樣方就挑格數少的
 */
export function gridFor(n: number, aspect: number) {
  const max = Math.max(9, Math.floor(n * 1.25));
  let best = { cols: 3, rows: 3, off: Infinity, cells: 9 };
  for (let rows = 3; rows * 3 <= max; rows++) {
    for (let cols = 3; cols * rows <= max; cols++) {
      const cells = cols * rows;
      if (cells < n) continue;
      // 格子寬高比 = (aspect / cols) / (1 / rows)；取 log 讓扁 2 倍跟長 2 倍一樣差
      const off = Math.abs(Math.log((aspect * rows) / cols));
      if (off < best.off - 1e-9 || (Math.abs(off - best.off) < 1e-9 && cells < best.cells)) {
        best = { cols, rows, off, cells };
      }
    }
  }
  return { cols: best.cols, rows: best.rows };
}

export function newBoard(cols: number, rows: number): Board {
  const cells: Owner[] = Array(cols * rows).fill(null);
  cells[originOf("left", cols, rows)] = "left";
  cells[originOf("right", cols, rows)] = "right";
  return { cols, rows, cells };
}

export const originOf = (side: Side, cols: number, rows: number) =>
  side === "left" ? 0 : cols * rows - 1;

function dist2(a: number, b: number, cols: number) {
  const dx = (a % cols) - (b % cols);
  const dy = Math.floor(a / cols) - Math.floor(b / cols);
  return dx * dx + dy * dy;
}

function neighbors(i: number, cols: number, rows: number) {
  const x = i % cols;
  const y = Math.floor(i / cols);
  const out: number[] = [];
  if (x > 0) out.push(i - 1);
  if (x < cols - 1) out.push(i + 1);
  if (y > 0) out.push(i - cols);
  if (y < rows - 1) out.push(i + cols);
  return out;
}

/**
 * 讓一隊的領地暈開 n 格，回傳新棋盤與依序變色的格子。
 *
 * 先長相鄰的中立格，挑離自己起點最近的 —— 領地像從角落暈開的扇形。
 * 碰不到中立格才吃對方，挑離對方起點最遠的，也就是先咬前線，對方領地不會被切碎。
 */
export function spread(
  board: Board,
  side: Side,
  n: number,
): { board: Board; changed: number[] } {
  const { cols, rows } = board;
  const cells = [...board.cells];
  const changed: number[] = [];
  const mine = originOf(side, cols, rows);
  const theirs = originOf(other(side), cols, rows);

  for (let k = 0; k < n; k++) {
    const edge = new Set<number>();
    cells.forEach((owner, i) => {
      if (owner !== side) return;
      for (const j of neighbors(i, cols, rows)) {
        if (cells[j] !== side) edge.add(j);
      }
    });
    const candidates = [...edge];
    const neutral = candidates.filter((i) => cells[i] === null);
    const pool = neutral.length > 0 ? neutral : candidates;
    if (pool.length === 0) break;
    // 距離一樣時取索引小的，同一個局面永遠長出同一格
    const score = (i: number) =>
      neutral.length > 0 ? dist2(i, mine, cols) : -dist2(i, theirs, cols);
    const pick = pool.reduce((a, b) =>
      score(b) < score(a) || (score(b) === score(a) && b < a) ? b : a,
    );
    cells[pick] = side;
    changed.push(pick);
  }
  return { board: { cols, rows, cells }, changed };
}

export const countOf = (board: Board, side: Side) =>
  board.cells.filter((c) => c === side).length;

/** 吃光對方的那一隊；還沒分出來回 null */
export function winnerOf(board: Board): Side | null {
  if (countOf(board, "right") === 0) return "left";
  if (countOf(board, "left") === 0) return "right";
  return null;
}

/** 題目出完時格子多的一隊贏；一樣多平手 */
export function leaderOf(board: Board): Side | null {
  const d = countOf(board, "left") - countOf(board, "right");
  if (d === 0) return null;
  return d > 0 ? "left" : "right";
}

export interface AnswerResult {
  correct: boolean;
  /** 這次結算讓哪一隊暈開 */
  side: Side;
  cells: number;
  /** true 代表這題結束，換下一題 */
  roundOver: boolean;
  /** 結算後誰在這題出局 */
  lockedOut: Side | null;
}

/**
 * 一次作答的結算。`lockedOut` 是這題先前已經答錯出局的那一隊。
 *
 * - 答對 → 自己暈開難度格數，這題結束
 * - 答錯 → 對方暈開 1 格；若對方還沒答過，對方接手同一題，否則這題結束
 */
export function resolveAnswer(
  question: Question,
  side: Side,
  choice: string,
  lockedOut: Side | null,
): AnswerResult {
  if (lockedOut === side) {
    throw new Error("出局的那隊不能再答同一題");
  }
  if (choice === question.answer) {
    return {
      correct: true,
      side,
      cells: cellValue(question),
      roundOver: true,
      lockedOut,
    };
  }
  return {
    correct: false,
    side: other(side),
    cells: WRONG_CELLS,
    // 對方已經答錯過就沒人能答了，這題到此為止
    roundOver: lockedOut !== null,
    lockedOut: side,
  };
}

/**
 * 這個單元用得上的題目：要能自動判對錯，所以只收選擇與是非。
 * 簡答不是壞資料 —— 大富翁的題庫直接拿過來就會有，匯入時略過並告知，不整份退件。
 */
export function playableOf(bank: Question[], cap: Difficulty = "hard") {
  return bank.filter((q) => q.type !== "short" && withinCap(q, cap));
}

/** 洗好的一整份出題順序；同一局不重複出題 */
export function drawQuestions(
  bank: Question[],
  cap: Difficulty,
  rng: Rng,
): Question[] {
  const pool = playableOf(bank, cap);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool;
}

/** 是非題的兩個選項，固定順序，畫面與判定同一份 */
export const BOOLEAN_OPTIONS = ["是", "否"];

export const optionsOf = (q: Question) =>
  q.type === "boolean" ? BOOLEAN_OPTIONS : (q.options ?? []);
