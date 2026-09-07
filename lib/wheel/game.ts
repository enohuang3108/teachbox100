// 轉盤的規則：名單解析、抽選、停在哪一格的角度。UI 只負責畫與轉。
import type { Rng } from "@/lib/monopoly/rng";

export const MIN_ENTRIES = 2;
export const MAX_ENTRIES = 60;
export const MAX_ENTRY_LENGTH = 20;
/** 轉幾圈才停：太少沒懸念，太多等到不耐煩 */
export const MIN_TURNS = 5;
export const EXTRA_TURNS = 2;
export const SPIN_MS = 4200;

export const STARTER_TEXT = ["小明", "小華", "小美", "小強", "小芳", "小傑"].join("\n");

/** 一行一個，去頭尾空白、丟空行；重複保留（點名時同名不同人很常見） */
export const parseEntries = (text: string): string[] =>
  text
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);

export function validateEntries(entries: string[]): string | undefined {
  if (entries.length < MIN_ENTRIES) return `至少要 ${MIN_ENTRIES} 個項目`;
  if (entries.length > MAX_ENTRIES) return `最多 ${MAX_ENTRIES} 個項目`;
  const long = entries.find((e) => Array.from(e).length > MAX_ENTRY_LENGTH);
  if (long) return `「${long}」超過 ${MAX_ENTRY_LENGTH} 個字`;
  return undefined;
}

/** 每格的圓心角 */
export const sliceAngle = (count: number) => 360 / count;

/**
 * 算出讓第 index 格停在指標（12 點鐘方向）正下方的最終旋轉角。
 * 第 i 格畫在 [i*slice, (i+1)*slice) 順時針、從 12 點起算，
 * 要讓它轉到頂端就得逆時針轉回去，也就是旋轉 -(i+0.5)*slice。
 * 加上整圈數讓輪子永遠往前轉，並從目前角度續轉而不是跳回 0。
 * jitter ∈ [0,1) 讓指標不要每次都停在格子正中間。
 */
export function rotationFor(
  index: number,
  count: number,
  current: number,
  rng: Rng,
): number {
  const slice = sliceAngle(count);
  const jitter = (rng() - 0.5) * slice * 0.8;
  const target = 360 - (index + 0.5) * slice + jitter;
  const turns = MIN_TURNS + Math.floor(rng() * (EXTRA_TURNS + 1));
  const base = Math.ceil(current / 360) * 360;
  return base + turns * 360 + target;
}

/** 從最終角度反推指標指到哪一格；跟 rotationFor 互為逆運算，測試用 */
export function indexAt(rotation: number, count: number): number {
  const slice = sliceAngle(count);
  const norm = ((360 - (rotation % 360)) + 360) % 360;
  return Math.floor(norm / slice) % count;
}

export const SLICE_COLORS = ["red", "yellow", "blue"] as const;
export type SliceColor = (typeof SLICE_COLORS)[number];

/** 紅黃交錯；格數是奇數時最後一格會跟第一格撞色，那格改藍 */
export function sliceColors(count: number): SliceColor[] {
  return Array.from({ length: count }, (_, i) =>
    i === count - 1 && count % 2 === 1 && count > 1 ? "blue" : SLICE_COLORS[i % 2],
  );
}
