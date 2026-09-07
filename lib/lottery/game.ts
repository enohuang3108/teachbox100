// 抽籤機的幾何與風：純函式，UI 只負責畫。名單解析沿用轉盤的 parseEntries。
export { MAX_ENTRIES, MIN_ENTRIES, parseEntries, STARTER_TEXT, validateEntries } from "@/lib/wheel/game";

/** 球最小／最大半徑（px）：投影要看得到名字，別小過 14 */
export const BALL_R_MIN = 14;
export const BALL_R_MAX = 30;
/** 風一陣一陣：每隔幾秒噴一次；開蓋時機器噴得更勤 */
export const BURST_S = 2.6;
export const OPEN_BURST_RATIO = 0.6;
/** 陣與陣之間剩多少風（0–1） */
export const BREEZE = 0.12;

export interface Layout {
  cx: number;
  cy: number;
  r: number;
  ballR: number;
  tube: { x: number; w: number; top: number; bottom: number };
  /** 頂端開口的半角（弧度） */
  gap: number;
  /** 抽出的球排在右側，由上而下；一欄放滿往左再開一欄 */
  tray: { x0: number; y0: number; step: number; perCol: number };
}

/** 球體、頂端管子、托盤在畫布上的位置；管口比球寬一半，進得去但不是每次都中 */
export function layout(W: number, H: number, count: number): Layout {
  const r = Math.min(W * 0.4, H * 0.35);
  const cx = W / 2;
  const cy = H * 0.54;
  const ballR = Math.max(BALL_R_MIN, Math.min(BALL_R_MAX, (r * 0.55) / Math.sqrt(Math.max(count, 1))));
  const tubeW = ballR * 3 + 6;
  const tube = { x: cx - tubeW / 2, w: tubeW, top: cy - r - r * 0.32, bottom: cy - r };
  const gap = Math.asin(tubeW / 2 / r);
  const step = ballR * 2 + 12;
  const tray = { x0: W - 36 - ballR, y0: 36 + ballR, step, perCol: Math.max(1, Math.floor((H - 72) / step)) };
  return { cx, cy, r, ballR, tube, gap, tray };
}

/** 托盤上第 i 顆球的位置 */
export function traySlot(L: Layout, i: number) {
  const col = Math.floor(i / L.tray.perCol);
  const row = i % L.tray.perCol;
  return { x: L.tray.x0 - col * L.tray.step, y: L.tray.y0 + row * L.tray.step };
}

/** 風的強弱包絡（0–1）：快速上升、指數衰減，週期微微飄動才不像節拍器 */
export function windEnvelope(time: number, open: boolean): number {
  const period = (open ? BURST_S * OPEN_BURST_RATIO : BURST_S) * (1 + 0.15 * Math.sin(time * 0.37));
  const phase = (time % period) / period;
  const burst = phase < 0.1 ? phase / 0.1 : Math.exp(-(phase - 0.1) * 7);
  return BREEZE + (1 - BREEZE) * burst;
}
