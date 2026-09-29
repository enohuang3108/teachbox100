// 爬格子（鬼腳圖）的規則：橫槓怎麼長、從某一條線爬下去停在哪、分組結果怎麼排。UI 只負責畫與播放。
import type { Rng } from "@/lib/monopoly/rng";
import { parseEntries } from "@/lib/wheel/game";

export const MIN_PLAYERS = 2;
/** 整班都能爬；線多的時候畫面改細線、名字直書，靠清單與左右切換看結果 */
export const MAX_PLAYERS = 30;
export const MAX_NAME_LENGTH = 20;
/** 結果寫在最底下，直書時一格放不下太多字 */
export const MAX_RESULT_LENGTH = 10;
export const MIN_GROUPS = 2;
export const MAX_GROUPS = 10;

export type LadderMode = "custom" | "groups";

export const STARTER_NAMES = ["小明", "小華", "小美", "小強", "小芳", "小傑"].join("\n");
export const STARTER_RESULTS = ["擦黑板", "發作業", "澆花", "關燈", "排桌椅", "休息一天"].join("\n");

/** columns 條直線；rows 由上往下，每一列列出橫槓左端所在的直線 */
export interface Ladder {
  columns: number;
  rows: number[][];
}

export const parseNames = parseEntries;
export const parseResults = parseEntries;

export function buildLadder(columns: number, rng: Rng): Ladder {
  const count = Math.min(30, Math.max(8, Math.round(columns * 0.8) + 6));
  // 每一列打亂間隔的順序再放，由左往右放會讓左邊的橫槓特別多；
  // 上一列同一個間隔有橫槓就跳過，不然兩條線之間會來回折成一串鋸齒
  const rows: number[][] = [];
  for (let r = 0; r < count; r++) {
    const row: number[] = [];
    const gaps = Array.from({ length: columns - 1 }, (_, i) => i);
    for (let i = gaps.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [gaps[i], gaps[j]] = [gaps[j], gaps[i]];
    }
    for (const gap of gaps) {
      const blocked = row.includes(gap - 1) || row.includes(gap + 1) || rows[r - 1]?.includes(gap);
      if (!blocked && rng() < 0.4) row.push(gap);
    }
    rows.push(row.sort((a, b) => a - b));
  }
  // 有一對相鄰直線完全沒有橫槓，那兩邊的人就永遠換不了位置 —— 補一條進去
  for (let gap = 0; gap < columns - 1; gap++) {
    if (rows.some((row) => row.includes(gap))) continue;
    const free = rows.filter((row) => !row.includes(gap - 1) && !row.includes(gap + 1));
    const target = free.length ? free[Math.floor(rng() * free.length)] : rows[rows.push([]) - 1];
    target.push(gap);
    target.sort((a, b) => a - b);
  }
  return { columns, rows };
}

/**
 * 從第 start 條線頂端爬下去。points 是轉折點 [直線, 高度]：高度 0 是頂端，
 * 第 r 列橫槓在高度 r + 1，底端是 rows.length + 1。
 */
export function trace(ladder: Ladder, start: number) {
  let col = start;
  const points: [number, number][] = [[col, 0]];
  ladder.rows.forEach((row, r) => {
    const next = row.includes(col) ? col + 1 : row.includes(col - 1) ? col - 1 : col;
    if (next === col) return;
    points.push([col, r + 1], [next, r + 1]);
    col = next;
  });
  points.push([col, ladder.rows.length + 1]);
  return { end: col, points };
}

/** 分組模式底下的結果：各組人數最多差一人，位置打散 */
export function groupLabels(players: number, groups: number, rng: Rng): string[] {
  const labels = Array.from({ length: players }, (_, i) => `第 ${(i % groups) + 1} 組`);
  for (let i = labels.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [labels[i], labels[j]] = [labels[j], labels[i]];
  }
  return labels;
}

export function validateSetup(
  names: string[],
  { mode, results, groupCount }: { mode: LadderMode; results: string[]; groupCount: number },
): string | undefined {
  if (names.length < MIN_PLAYERS) return `至少要 ${MIN_PLAYERS} 個人`;
  if (names.length > MAX_PLAYERS) return `最多 ${MAX_PLAYERS} 個人`;
  const longName = names.find((n) => Array.from(n).length > MAX_NAME_LENGTH);
  if (longName) return `「${longName}」超過 ${MAX_NAME_LENGTH} 個字`;
  if (mode === "groups") {
    if (groupCount > names.length) return `${names.length} 個人最多分 ${names.length} 組`;
    return undefined;
  }
  if (results.length !== names.length)
    return `結果要跟名單一樣多（名單 ${names.length} 個，結果 ${results.length} 個）`;
  const longResult = results.find((r) => Array.from(r).length > MAX_RESULT_LENGTH);
  if (longResult) return `「${longResult}」超過 ${MAX_RESULT_LENGTH} 個字`;
  return undefined;
}
